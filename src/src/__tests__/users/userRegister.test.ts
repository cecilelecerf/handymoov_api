import supertest from "supertest";
import { Op } from "sequelize";
import createServer from "../../utils/server";
import User from "../../models/userModel";
import { loginUser, registerUser } from "./usersConst";

const app = createServer();

describe("User POST /users/register", () => {
  afterEach(async () => {
    try {
      await User.destroy({ where: { email: { [Op.notLike]: "%test%" } } });
    } catch (error) {
      console.log("error destroy");
      console.log(error);
    }
  });

  it("should return 204 when registering a new user", async () => {
    const { statusCode, body } = await supertest(app)
      .post("/users/register")
      .send(registerUser);
    console.log("registerError");
    console.log(body);
    expect(statusCode).toBe(204);
  });

  describe("should return 400 if information is missing", () => {
    it("email is missing", async () => {
      const { email, ...inputUser } = registerUser;
      const { statusCode, body } = await supertest(app)
        .post("/users/register")
        .send(inputUser);

      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["email"],
        msg: "Votre email est obligatoire.",
      });
    });
    it("firstname is missing", async () => {
      const { firstname, ...inputUser } = registerUser;
      const { statusCode, body } = await supertest(app)
        .post("/users/register")
        .send(inputUser);
      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["firstname"],
        msg: "Votre prénom est obligatoire.",
      });
    });
  });

  it("lastname is missing", async () => {
    const { lastname, ...inputUser } = registerUser;
    const { statusCode, body } = await supertest(app)
      .post("/users/register")
      .send(inputUser);
    expect(statusCode).toBe(400);
    expect(body).toEqual({
      param: ["lastname"],
      msg: "Votre nom est obligatoire.",
    });
  });
  it("birthday is missing", async () => {
    const { birthday, ...inputUser } = registerUser;
    const { statusCode, body } = await supertest(app)
      .post("/users/register")
      .send(inputUser);

    expect(statusCode).toBe(400);
    expect(body).toEqual({
      param: ["birthday"],
      msg: "Votre date de naissance est obligatoire.",
    });
  });

  describe("should return 400 if lastname or firstname is not the correct length", () => {
    it("fistname > 50 character", async () => {
      const { statusCode, body } = await supertest(app)
        .post("/users/register")
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
        .post("/users/register")
        .send({ ...registerUser, lastname: "123" });
      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["lastname"],
        msg: "Votre nom doit contenir entre 5 et 50 caractères.",
      });
    });

    it("fistname < 5 character", async () => {
      const { statusCode, body } = await supertest(app)
        .post("/users/register")
        .send({ ...registerUser, firstname: "123" });
      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["firstname"],
        msg: "Votre prénom doit contenir entre 5 et 50 caractères.",
      });
    });

    it("lastname > 50 character", async () => {
      const { statusCode, body } = await supertest(app)
        .post("/users/register")
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

  it("should return 409 if password is different from confirmPassword", async () => {
    const { statusCode, body } = await supertest(app)
      .post("/users/register")
      .send({ ...registerUser, confirmPassword: "123" });
    expect(statusCode).toBe(409);
    expect(body).toEqual({
      param: ["confirmPassword"],
      msg: "Les mots de passe ne sont pas identiques.",
    });
  });

  describe("validate email", () => {
    it("should return 409 if duplicate email", async () => {
      await supertest(app).post("/users/register").send(registerUser);
      const { statusCode, body } = await supertest(app)
        .post("/users/register")
        .send(registerUser);
      expect(statusCode).toBe(409);
      expect(body).toEqual({
        param: ["email"],
        msg: "Cet email existe déjà.",
      });
    });

    it("should return 400 if email format is invalid", async () => {
      const response = await supertest(app)
        .post("/users/register")
        .send({ ...registerUser, email: "invalidemail" });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        param: ["email"],
        msg: "Le format de l'email est invalide.",
      });
    });

    describe(" should return 400 if email is not the correct length", () => {
      it("email > 70", async () => {
        const response = await supertest(app)
          .post("/users/register")
          .send({
            ...registerUser,
            email: `${"a".repeat(41)}@${"a".repeat(40)} .com`,
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
        const responseShort = await supertest(app)
          .post("/users/register")
          .send({ ...registerUser, email: "a".repeat(41) + "@example.com" });

        expect(responseShort.statusCode).toBe(400);
        expect(responseShort.body).toEqual({
          param: ["email"],
          msg: "La partie avant l’arobase doit contenir entre 1 et 40 caractères.",
        });
      });
    });

    describe("should return 400 if the part after '@' is too short or too long", () => {
      it("if part after is too short", async () => {
        const responseShort = await supertest(app)
          .post("/users/register")
          .send({ ...registerUser, email: "azz@b.c" });

        expect(responseShort.statusCode).toBe(400);
        expect(responseShort.body).toEqual({
          param: ["email"],
          msg: "La partie après l’arobase doit contenir entre 4 et 40 caractères.",
        });
      });

      it("if part after is too long", async () => {
        const responseShort = await supertest(app)
          .post("/users/register")
          .send({
            ...registerUser,
            email: "john@" + "a".repeat(41) + ".com",
          });

        expect(responseShort.statusCode).toBe(400);
        expect(responseShort.body).toEqual({
          param: ["email"],
          msg: "La partie après l’arobase doit contenir entre 4 et 40 caractères.",
        });
      });
    });
  });
  describe("validate password", () => {
    it("should return 400 if password is less than 7 characters", async () => {
      const inputUser = {
        ...registerUser,
        password: "Pass1!",
        confirmPassword: "Pass1!",
      };
      const { statusCode, body } = await supertest(app)
        .post("/users/register")
        .send(inputUser);

      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["password"],
        msg: "Le mot de passe doit comporter plus de 7 caractères.",
      });
    });

    it("should return 400 if password does not contain an uppercase letter", async () => {
      const inputUser = {
        ...registerUser,
        password: "password1!",
        confirmPassword: "password1!",
      };
      const { statusCode, body } = await supertest(app)
        .post("/users/register")
        .send(inputUser);

      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["password"],
        msg: "Le mot de passe doit contenir au moins une majuscule.",
      });
    });

    it("should return 400 if password does not contain a lowercase letter", async () => {
      const inputUser = {
        ...registerUser,
        password: "PASSWORD1!",
        confirmPassword: "PASSWORD1!",
      };
      const { statusCode, body } = await supertest(app)
        .post("/users/register")
        .send(inputUser);

      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["password"],
        msg: "Le mot de passe doit contenir au moins une minuscule.",
      });
    });

    it("should return 400 if password does not contain a number", async () => {
      const inputUser = {
        ...registerUser,
        password: "Password!",
        confirmPassword: "Password!",
      };
      const { statusCode, body } = await supertest(app)
        .post("/users/register")
        .send(inputUser);

      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["password"],
        msg: "Le mot de passe doit contenir au moins un chiffre.",
      });
    });

    it("should return 400 if password does not contain a special character", async () => {
      const inputUser = {
        ...registerUser,
        password: "Password1",
        confirmPassword: "Password1",
      };
      const { statusCode, body } = await supertest(app)
        .post("/users/register")
        .send(inputUser);

      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["password"],
        msg: "Le mot de passe doit contenir au moins un caractère spécial.",
      });
    });
  });

  describe("should return 400 if date not valid", () => {
    it("if not a valid date", async () => {
      const { birthday, ...inputUser } = registerUser;
      const { statusCode, body } = await supertest(app)
        .post("/users/register")
        .send(inputUser);

      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["birthday"],
        msg: "Votre date de naissance est obligatoire.",
      });
    });
    it("if not a valid date", async () => {
      const { statusCode, body } = await supertest(app)
        .post("/users/register")
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
        .post("/users/register")
        .send({ ...registerUser, birthday: under18Birthday.toISOString() });

      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["birthday"],
        msg: "Vous devez avoir plus de 18 ans.",
      });
    });
  });
  it("should return 400 if cgu doesn't accept", async () => {
    const { statusCode, body } = await supertest(app)
      .post("/users/register")
      .send({ ...registerUser, cgu: false });
    expect(statusCode).toBe(400);
    expect(body).toEqual({
      param: ["cgu"],
      msg: "Les conditions générales d'utilisation sont obligatoires.",
    });
  });
});
