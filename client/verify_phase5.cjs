const axios = require('axios');

async function verify() {
  try {
    const api = axios.create({ baseURL: 'http://localhost:5000/api' });
    let token = '';
    
    // Register or login
    try {
      await api.post('/auth/register', { username: 'testuser10', email: 'testuser10@test.com', password: 'Password123!' });
    } catch (e) {}
    const res = await api.post('/auth/login', { email: 'testuser10@test.com', password: 'Password123!' });
    token = res.data.data.accessToken;
    
    console.log('Login successful');
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Add to library
    const resAdd = await api.post('/library/add', { media_type: 'movie', media_id: 27205, status: 'planned' });
    console.log('Add to library successful:', resAdd.data.data.tmdb_id);
    
    // Update item status
    const resUpdate = await api.put('/library/update', { media_type: 'movie', media_id: 27205, status: 'watching' });
    console.log('Update status successful:', resUpdate.data.data.status);
    
    // Toggle favorite
    const resFav = await api.put('/library/update', { media_type: 'movie', media_id: 27205, favorite: true });
    console.log('Update favorite successful:', resFav.data.data.favorite);
    
    // Check favorites
    const resFavs = await api.get('/library/favorites');
    console.log('Get favorites successful, count:', resFavs.data.data.length);
    
    // Remove item
    const resRemove = await api.delete('/library/remove', { data: { media_type: 'movie', media_id: 27205 } });
    console.log('Remove successful');
    
    // Check dashboard (activity log doesn't have an endpoint yet, but we can verify it via DB if needed)
    console.log('ALL VERIFICATIONS PASSED');
  } catch (error) {
    console.error('VERIFICATION FAILED', error.response ? error.response.data : error.message);
  }
}

verify();
