import noAuthApiClient from "../noAuthApiClient";

// Login Options
export const fetchBranchesData = async (username) => {
  try {
    const response = await noAuthApiClient.post("/auth/login/branchOnUser", {
      username: username,
    });
    return response.data;
  } catch (err) {
    console.error("Error fetching branches:", err);
    throw err;
  }
};

export const fetchCounters = async (branch, successRes) => {
  try {
    const response = await noAuthApiClient.post(
      "/auth/login/CounterOnBranchAndUser",
      {
        vBranchCode: branch.vBranchCode,
        vUID: successRes.vUID,
        nBranchID: branch.nBranchID,
        nUserID: successRes.nUserID,
      }
    );
    return response.data;
  } catch (err) {
    console.error("Error fetching counters:", err);
    throw err;
  }
};

export const fetchFinYearData = async () => {
  try {
    const response = await noAuthApiClient.get("/auth/login/finYear");
    return response.data;
  } catch (error) {
    console.error("Error fetching financial years:", error);
    throw error;
  }
};

// Login Function To Authenticate User
export const loginPreFetch = async (username, password) => {
  try {
    const response = await noAuthApiClient.post("/auth/login", {
      username: username.toUpperCase(),
      password: password,
    });

    const { token, user } = response.data;

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("userid", user.nUserID);
      localStorage.setItem("username", user.vUID);
    }

    return { token, user };
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};
