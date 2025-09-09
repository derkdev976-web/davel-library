// Clear authentication data script
// This script clears all NextAuth.js related cookies and localStorage

console.log('Clearing authentication data...');

// Clear all cookies
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

// Clear localStorage
localStorage.clear();

// Clear sessionStorage
sessionStorage.clear();

console.log('Authentication data cleared successfully!');
console.log('Please refresh the page to continue.');
