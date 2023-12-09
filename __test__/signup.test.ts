import request from "supertest";
import { app } from "../app"; // Import your Express app

let server: any;
beforeAll(() => {
  server = app.listen(); // Start server
});

afterAll((done) => {
  server.close(done); // Stop server after tests
});

describe("Sign up tets", () => {
  it("should respond with a 201 status code for valid input", async () => {
    const response = await request(app).post("/api/v1/signup").send({
      firstName: "John",
      lastName: "Doe",
      phoneNumber: "08012345333",
      email: "youemail@gmail.com",
      password: "123456Adodnhope",
    });

    expect(response.statusCode).toBe(201);
  });

  it("should respond with a 400 status code for invalid input", async () => {
    const response = await request(app).post("/api/v1/signup").send({
      email: "myemail@gmail.co",
      password: "",
    });

    expect(response.statusCode).toBe(400);
  });

  it("should respond with a 400 status code for missing input", async () => {
    const response = await request(app).post("/api/v1/signup").send({
      firstName: "John",
      lastName: "Doe",
      email: "myemail@gmail.com",
      password: "123456Adodnhope",
    });

    expect(response.statusCode).toBe(400);
  });

  it("should respond with a 400 status code for account exists", async () => {
    const response = await request(app).post("/api/v1/signup").send({
      email: "myemail@gmail.co",
      password: "123456Adodnhope",
    });

    expect(response.statusCode).toBe(400);
  });
});
