#!/usr/bin/env node

/**
 * Test Chef Search Filtering
 * This script tests the chef search filtering to identify the white page issue
 */

const buildApiEndpoint = (path) => `http://localhost:5000/api${path}`;

async function testChefFiltering() {
  console.log('\n🧪 === TESTING CHEF FILTERING ===\n');

  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OGU2ZTFhYzhlMGI2ZTljOTk5N2YwOCIsImlhdCI6MTc1NzA1MzgxOSwiZXhwIjoxNzU3MTQwMjE5fQ.QkUtWrGsY5h5yWjRNsj00sJKOuuNTuxY_X622QcpB58';

  try {
    // Test 1: No filters (should work)
    console.log('📋 Test 1: Fetching all chefs (no filters)...');
    const allChefsResponse = await fetch(buildApiEndpoint('/chefs'), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (allChefsResponse.ok) {
      const allChefsData = await allChefsResponse.json();
      console.log('✅ All chefs response:', {
        success: allChefsData.success,
        message: allChefsData.message,
        chefCount: allChefsData.chefs?.length || allChefsData.data?.length || 0
      });
    } else {
      console.log('❌ All chefs failed:', allChefsResponse.status);
    }

    // Test 2: Frontend filter format (what's actually sent)
    console.log('\n📋 Test 2: Frontend filter format (search=italian)...');
    const frontendFilterResponse = await fetch(buildApiEndpoint('/chefs/search?search=indian'), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (frontendFilterResponse.ok) {
      const frontendFilterData = await frontendFilterResponse.json();
      console.log('✅ Frontend filter response:', {
        success: frontendFilterData.success,
        message: frontendFilterData.message,
        chefCount: frontendFilterData.chefs?.length || frontendFilterData.data?.length || 0,
        responseKeys: Object.keys(frontendFilterData)
      });
    } else {
      console.log('❌ Frontend filter failed:', frontendFilterResponse.status);
      const errorText = await frontendFilterResponse.text();
      console.log('Error response:', errorText);
    }

    // Test 3: Backend expected format (what backend expects)
    console.log('\n📋 Test 3: Backend expected format (q=indian)...');
    const backendFilterResponse = await fetch(buildApiEndpoint('/chefs/search?q=indian'), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (backendFilterResponse.ok) {
      const backendFilterData = await backendFilterResponse.json();
      console.log('✅ Backend filter response:', {
        success: backendFilterData.success,
        message: backendFilterData.message,
        chefCount: backendFilterData.chefs?.length || backendFilterData.data?.length || 0,
        responseKeys: Object.keys(backendFilterData)
      });
    } else {
      console.log('❌ Backend filter failed:', backendFilterResponse.status);
    }

    // Test 4: Cuisine filter
    console.log('\n📋 Test 4: Cuisine filter (cuisine=Indian)...');
    const cuisineFilterResponse = await fetch(buildApiEndpoint('/chefs/search?cuisine=Indian'), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (cuisineFilterResponse.ok) {
      const cuisineFilterData = await cuisineFilterResponse.json();
      console.log('✅ Cuisine filter response:', {
        success: cuisineFilterData.success,
        message: cuisineFilterData.message,
        chefCount: cuisineFilterData.chefs?.length || cuisineFilterData.data?.length || 0
      });
    } else {
      console.log('❌ Cuisine filter failed:', cuisineFilterResponse.status);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n🧪 === FILTERING TEST COMPLETED ===\n');
}

// Run the test
testChefFiltering();
