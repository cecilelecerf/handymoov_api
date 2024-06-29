import supertest from "supertest";
import {
  RegisterUserProps,
  UserProps,
  loginUser,
  registerUser,
  user,
} from "./usersConst";
import createServer from "../../utils/server";
import User from "../../models/userModel";
import { Op } from "sequelize";

const app = createServer();

describe("PATCH EMAIL /users/updateEmail", () => {
  interface UserEmailPatch {
    lastEmail: UserProps["email"];
    email: UserProps["email"];
    confirmEmail: UserProps["email"];
  }
  const newEmail = "poiu1@UA.com";
  const userEmailPatch: UserEmailPatch = {
    lastEmail: user["email"],
    email: newEmail,
    confirmEmail: newEmail,
  };

  let token: string;
  beforeEach(async () => {
    await supertest(app).post("/users/register").send(registerUser);
    const loginRes = await supertest(app).post("/users/login").send(loginUser);
    token = loginRes.body.token;
  });
  afterEach(async () => {
    await User.destroy({ where: { email: { [Op.notLike]: "%test%" } } });
  });
  it("should return 204 if valid update Email", async () => {
    const response = await supertest(app)
      .patch("/users/updateEmail")
      .set("authorization", token)
      .send(userEmailPatch);
    expect(response.status).toBe(204);
  });
  describe("validate email", () => {
    it("should return 409 if duplicate email", async () => {
      // register new people
      const newPeople: RegisterUserProps = {
        email: newEmail,
        firstname: user["firstname"],
        lastname: user["lastname"],
        birthday: user["birthday"],
        password: user["password"],
        confirmPassword: user["password"],
        wheelchair: user["wheelchair"],
        cgu: true,
      };
      await supertest(app).post("/users/register").send(newPeople);

      // req
      const { statusCode, body } = await supertest(app)
        .patch("/users/updateEmail")
        .set("authorization", token)
        .send(userEmailPatch);
      expect(statusCode).toBe(409);
      expect(body).toEqual({
        param: ["email"],
        msg: "Cet email existe déjà.",
      });
    });

    it("should return 400 if email format is invalid", async () => {
      const newEmail = "invalidemail";
      const response = await supertest(app)
        .patch("/users/updateEmail")
        .set("authorization", token)
        .send({ ...userEmailPatch, email: newEmail, confirmEmail: newEmail });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        param: ["email"],
        msg: "Le format de l'email est invalide.",
      });
    });

    describe(" should return 409 if email is not the correct length", () => {
      it("email > 70", async () => {
        const newEmail = `${"a".repeat(41)}@${"a".repeat(40)} .com`;
        const response = await supertest(app)
          .patch("/users/updateEmail")
          .set("authorization", token)
          .send({
            ...userEmailPatch,
            email: newEmail,
            confirmEmail: newEmail,
          });

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
          param: ["email"],
          msg: "Votre email doit contenir entre 5 et 70 caractères.",
        });
      });
    });

    describe("should return 400 if the part before '@' is too short or too long", () => {
      it("if part before is too long", async () => {
        const newEmail = "a".repeat(41) + "@example.com";
        const responseShort = await supertest(app)
          .patch("/users/updateEmail")
          .set("authorization", token)
          .send({
            ...userEmailPatch,
            email: newEmail,
            confirmEmail: newEmail,
          });

        expect(responseShort.statusCode).toBe(400);
        expect(responseShort.body).toEqual({
          param: ["email"],
          msg: "La partie avant l’arobase doit contenir entre 1 et 40 caractères.",
        });
      });
    });

    describe("should return 400 if the part after '@' is too short or too long", () => {
      it("if part after is too short", async () => {
        const newEmail = "azz@b.c";
        const responseShort = await supertest(app)
          .patch("/users/updateEmail")
          .set("authorization", token)
          .send({
            ...userEmailPatch,
            email: newEmail,
            confirmEmail: newEmail,
          });

        expect(responseShort.statusCode).toBe(400);
        expect(responseShort.body).toEqual({
          param: ["email"],
          msg: "La partie après l’arobase doit contenir entre 4 et 40 caractères.",
        });
      });

      it("if part after is too long", async () => {
        const newEmail = "john@" + "a".repeat(41) + ".com";
        const responseShort = await supertest(app)
          .patch("/users/updateEmail")
          .set("authorization", token)
          .send({
            ...userEmailPatch,
            email: newEmail,
            confirmEmail: newEmail,
          });

        expect(responseShort.statusCode).toBe(400);
        expect(responseShort.body).toEqual({
          param: ["email"],
          msg: "La partie après l’arobase doit contenir entre 4 et 40 caractères.",
        });
      });
    });
  });
  describe("should return 400 if information is missing", () => {
    it("email is missing", async () => {
      const { email, ...inputUser } = userEmailPatch;
      const { statusCode, body } = await supertest(app)
        .patch("/users/updateEmail")
        .set("authorization", token)
        .send(inputUser);

      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["email"],
        msg: "L'email est obligatoire.",
      });
    });
    it("confirmEmail is missing", async () => {
      const { confirmEmail, ...inputUser } = userEmailPatch;
      const { statusCode, body } = await supertest(app)
        .patch("/users/updateEmail")
        .set("authorization", token)
        .send(inputUser);

      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["confirmEmail"],
        msg: "La confirmation d'email est obligatoire.",
      });
    });
    it("lastEmail is missing", async () => {
      const { lastEmail, ...inputUser } = userEmailPatch;
      const { statusCode, body } = await supertest(app)
        .patch("/users/updateEmail")
        .set("authorization", token)
        .send(inputUser);

      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["lastEmail"],
        msg: "L'ancien email est obligatoire.",
      });
    });
  });
});
