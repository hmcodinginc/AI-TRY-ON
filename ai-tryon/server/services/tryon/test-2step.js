require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const TryOffDiffProvider = require('./TryOffDiffProvider'); // Re-using existing IDM-VTON step 1 from this

(async () => {
  try {
    const customer = { imagePath: '/storage/users/user_user_001_1790266480660_488.jpg' };
    const outfit = {
      top: { name: 'Brown Casual Shirt', color: 'Brown', category: 'Shirts', imageUrl: '/storage/products/my-new-brown-shirt.jpg' },
      bottom: { name: 'Beige Chinos', color: 'Beige', category: 'Pants', imageUrl: '/storage/products/P-4001-beige-chinos.jpg' }
    };

    console.log('--- STARTING 2-STEP VTO DEMO TEST ---');
    
    // ==========================================
    // STEP 1: IDM-VTON (Upper Body)
    // ==========================================
    console.log('Running Step 1: IDM-VTON (Upper Body)...');
    
    const storageRoot = path.join(__dirname, '../../../../storage');
    const temps = [];
    const customerPath = await TryOffDiffProvider._ensureLocalFile(storageRoot, customer.imagePath, 'Customer', temps);
    const topPath = await TryOffDiffProvider._ensureLocalFile(storageRoot, outfit.top.imageUrl, 'Top', temps);
    const bottomPath = await TryOffDiffProvider._ensureLocalFile(storageRoot, outfit.bottom.imageUrl, 'Bottom', temps);
    
    console.log('STEP 1 INPUT PERSON:', customerPath);
    console.log('STEP 1 INPUT TOP:', topPath);

    const personJpg = await TryOffDiffProvider._compress(customerPath, temps);
    const topJpg = await TryOffDiffProvider._compress(topPath, temps);
    
    const { Client, handle_file } = await import('@gradio/client');
    const hfToken = process.env.HF_TOKEN;
    const client1 = await Client.connect('yisol/IDM-VTON', hfToken ? { token: hfToken } : {});
    
    const afterTop = await TryOffDiffProvider._tryOnGarment(
      client1, handle_file, personJpg, topJpg, 
      TryOffDiffProvider._garmentPrompt(outfit.top, 'upper-body top')
    );
    const result1Path = await TryOffDiffProvider._persistRemoteImage(afterTop, path.join(storageRoot, `tryon-results/step1_demo_${Date.now()}.jpg`), hfToken);

    console.log('STEP 1 RESULT PATH:', result1Path);

    // ==========================================
    // STEP 2: OOTDiffusion (Lower Body)
    // ==========================================
    console.log('\nRunning Step 2: OOTDiffusion (Lower Body)...');
    console.log('STEP 2 PERSON IMAGE PATH:', result1Path);
    console.log('STEP 2 PANTS IMAGE PATH:', bottomPath);
    
    try {
      const client2 = await Client.connect('levihsu/OOTDiffusion', hfToken ? { token: hfToken } : {});
      
      const bottomJpg = await TryOffDiffProvider._compress(bottomPath, temps);

      const response = await client2.predict('/process_dc', {
        vton_img: handle_file(result1Path),
        garm_img: handle_file(bottomJpg),
        category: 'Lower-body',
        n_samples: 1,
        n_steps: 20,
        image_scale: 2,
        seed: 42
      });
      
      console.log('STEP 2 RAW API RESPONSE:', JSON.stringify(response.data).substring(0, 500));
      
      const gallery = response.data[0]; // Gallery component
      let outputImage;
      if (Array.isArray(gallery) && gallery.length > 0) {
        // Extract the first image from the gallery
        outputImage = gallery[0].image || gallery[0];
      } else {
        outputImage = gallery;
      }
      
      const imageUrl = outputImage?.url || outputImage?.path || outputImage;
      console.log('STEP 2 API RESPONSE (IMAGE URL/PATH):', imageUrl);
      
      const result2Path = path.join(storageRoot, `tryon-results/step2_demo_${Date.now()}.jpg`);
      await TryOffDiffProvider._persistRemoteImage(imageUrl, result2Path, hfToken);
      
      console.log('STEP 2 RESULT PATH:', result2Path);
    } catch (err) {
      console.error('STEP 2 API RESPONSE: FAILED -', err.message);
      console.log('STEP 2 RESULT PATH: N/A');
    }
    
    console.log('--- TEST COMPLETE ---');
    process.exit(0);
  } catch (err) {
    console.error('Test Error:', err);
    process.exit(1);
  }
})();
