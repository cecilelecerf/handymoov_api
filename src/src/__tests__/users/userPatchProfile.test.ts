import supertest from "supertest";
import { loginUser, registerUser } from "./usersConst";
import createServer from "../../utils/server";

const app = createServer();

describe("PATCH PROFIL /users/updateProfil", () => {
  let token: string;
  beforeEach(async () => {
    await supertest(app).post("/users/register").send(registerUser);
    const loginRes = await supertest(app).post("/users/login").send(loginUser);
    token = loginRes.body.token;
  });
  it("should return 204 when updating profile a user", async () => {
    const req = await supertest(app)
      .patch("/users/updateProfil")
      .set("authorization", token)
      .send(registerUser);
    expect(req.statusCode).toBe(204);
  });

  describe("should return 409 if lastname or firstname is not the correct length", () => {
    it("fistname > 50 character", async () => {
      const { statusCode, body } = await supertest(app)
        .patch("/users/updateProfil")
        .set("authorization", token)
        .send({
          ...registerUser,
          firstname:
            "1234567890AZERTYUIOPMLKJHGFDSQWXCVBNlPOIUYTREZAQSDFGHJKLMNBVCXWqQSDFGHJ",
        });
      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["firstname"],
        msg: "Votre prénom doit contenir entre 5 et 50 caractères.",
      });
    });

    it("lastname < 5 character", async () => {
      const { statusCode, body } = await supertest(app)
        .patch("/users/updateProfil")
        .set("authorization", token)
        .send({ ...registerUser, lastname: "123" });
      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["lastname"],
        msg: "Votre nom doit contenir entre 5 et 50 caractères.",
      });
    });

    it("fistname < 5 character", async () => {
      const { statusCode, body } = await supertest(app)
        .patch("/users/updateProfil")
        .set("authorization", token)
        .send({ ...registerUser, firstname: "123" });
      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["firstname"],
        msg: "Votre prénom doit contenir entre 5 et 50 caractères.",
      });
    });

    it("lastname > 50 character", async () => {
      const { statusCode, body } = await supertest(app)
        .patch("/users/updateProfil")
        .set("authorization", token)
        .send({
          ...registerUser,
          lastname:
            "1234567890AZERTYUIOPMLKJHGFDSQWXCVBNlPOIUYTREZAQSDFGHJKLMNBVCXWqQSDFGHJ",
        });
      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["lastname"],
        msg: "Votre nom doit contenir entre 5 et 50 caractères.",
      });
    });
  });

  describe("should return 400 if date not valid", () => {
    it("if not a valid date", async () => {
      const { statusCode, body } = await supertest(app)
        .patch("/users/updateProfil")
        .set("authorization", token)
        .send({ ...registerUser, birthday: "invalid-email" });

      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["birthday"],
        msg: "Le format de la date de naissance est invalide.",
      });
    });
    it("if the user is under 18", async () => {
      const under18Birthday = new Date();
      under18Birthday.setFullYear(under18Birthday.getFullYear() - 17);
      under18Birthday.setDate(under18Birthday.getDate() + 1);
      const { statusCode, body } = await supertest(app)
        .patch("/users/updateProfil")
        .set("authorization", token)
        .send({ ...registerUser, birthday: under18Birthday.toISOString() });

      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["birthday"],
        msg: "Vous devez avoir plus de 18 ans.",
      });
    });
  });
});
