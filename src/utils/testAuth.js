export const testUserType = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('No hay token');
    return;
  }

  try {
    const response = await fetch('/api/user/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Perfil de usuario:', data);
    console.log('Tipo de usuario:', data.user?.tipo || data.tipo);
    
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};