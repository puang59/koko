export const getUserId = (): string => {
  let userId = localStorage.getItem("user_id");
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem("user_id", userId);
  }
  return userId;
};
