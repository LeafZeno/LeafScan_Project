async function getCurrentSession() {
  const { data, error } = await supabaseClient.auth.getSession();
  if (error) {
    console.log("Session error:", error);
    return null;
  }
  return data.session;
}

async function getCurrentUser() {
  const { data, error } = await supabaseClient.auth.getUser();
  if (error) {
    console.log("User error:", error);
    return null;
  }
  return data.user;
}

async function requireAuth(redirectTo = "login.html") {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = redirectTo;
    return null;
  }
  return user;
}

async function signOutUser() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    console.log("Sign out error:", error);
    return;
  }
  window.location.href = "index.html";
}
