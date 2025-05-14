import { apiClient } from "../apiClient";

export const fetchNavigationItems = async () => {
  try {
    const response = await apiClient.get("/nav/navigation");
    const fetchedItems = response.data.map((item) => ({
      ...item,
      open: false,
    }));
    return fetchedItems;
  } catch (error) {
    console.error("Error fetching navigation items:", error);
    throw error;
  }
};
