export function checkLogin() {
    return !!localStorage.getItem('token');
}