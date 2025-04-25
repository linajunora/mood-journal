export const logout = () => {
    sessionStorage.clear(); // removes all session items
    window.location.href = '../index.html';
  }