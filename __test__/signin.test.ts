import request from "supertest";
import { app } from "../app"; // Import your Express app

let server: any;
beforeAll(() => {
  server = app.listen(); // Start server
});

afterAll((done) => {
  server.close(done); // Stop server after tests
});

describe("Sign in tests", () => {
  it("should respond with a 200 status code for valid input", async () => {
    const response = await request(app).post("/api/v1/signin-password").send({
      email: "myemail@gmail.com",
      password: "123456Adodnhope",
    });

    expect(response.statusCode).toBe(200);
  });

  it("should respond with a 400 status code for invalid input", async () => {
    const response = await request(app).post("/api/v1/signin-password").send({
      email: "myemail@gmail.co",
      password: "",
    });

    expect(response.statusCode).toBe(400);
  });

  // Add more tests as needed
});
