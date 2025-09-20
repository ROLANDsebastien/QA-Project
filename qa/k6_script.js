import http from "k6/http";

export let options = {
  stages: [
    { duration: "30s", target: 10 },
    { duration: "30s", target: 50 },
    { duration: "0s", target: 0 },
  ],
};

export default function () {
  let response = http.get("https://httpbin.org/get");
  // Assuming there's a health endpoint; adjust if needed
}
