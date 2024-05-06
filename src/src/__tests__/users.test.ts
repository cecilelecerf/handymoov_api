import supertest from "supertest";
import createServer from "../utils/server";

const app = createServer();

const newUser = {
  email: "testkeeeee@example.com",
  firstname: "Jedzeddeohn",
  lastname: "Dezezdezoe",
  password: "12zaaz3",
  passwordConfirmation: "12zaaz3",
};

describe("User Controller", () => {
  describe("POST /register", () => {
    it("should return 204 when registering a new user", async () => {
      const response = await supertest(app)
        .post("/users/register")
        .send(newUser);
      expect(response.status).toBe(204);
    });
    it("should return 400 if email is missing", async () => {
      const newUser = {
        firstname: "John",
        lastname: "Doe",
        password: "password123",
        passwordConfirmation: "password123",
      };
      const response = await supertest(app)
        .post("/users/register")
        .send(newUser);
      expect(response.status).toBe(400);
    });
    it("should return 400 if firstname is missing", async () => {
      const newUser = {
        email: "ratat@gmail.com",
        lastname: "Doe",
        password: "password123",
        passwordConfirmation: "password123",
      };
      const response = await supertest(app)
        .post("/users/register")
        .send(newUser);
      expect(response.status).toBe(400);
    });
    it("should return 400 if lastname is missing", async () => {
      const newUser = {
        email: "ratat@gmail.com",
        firstname: "Doe",
        password: "password123",
        passwordConfirmation: "password123",
      };
      const response = await supertest(app)
        .post("/users/register")
        .send(newUser);
      expect(response.status).toBe(400);
    });
    it("should return 409 if password is differant of confirmPassword", async () => {
      const newUser = {
        email: "ratat@gmail.com",
        firstname: "Doe",
        lastname: "LAL",
        password: "password123",
        passwordConfirmation: "passworde123",
      };
      const response = await supertest(app)
        .post("/users/register")
        .send(newUser);
      expect(response.status).toBe(409);
    });
    it("should return 409 if duplicate email", async () => {
      const newUser1 = {
        email: "test@example.com",
        firstname: "John",
        lastname: "Doe",
        password: "password123",
        passwordConfirmation: "password123",
      };
      await supertest(app).post("/users/register").send(newUser1);
      const response = await supertest(app)
        .post("/users/register")
        .send(newUser1);
      expect(response.status).toBe(409);
    });
  });
});
