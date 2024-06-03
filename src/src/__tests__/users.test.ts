import createServer from "../utils/server";
import supertest from "supertest";
import User from "../models/userModel";
import PersonalizedAddress from "../models/personalizedAddress";
import { Op } from "sequelize";

interface UserProps {
  email: string;
  firstname: string;
  lastname: string;
  password: string;
}

interface RegisterUserProps {
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  confirmPassword: string;
}

let user: UserProps = {
  email: "register@example.com",
  firstname: "Jedzeddeoahn",
  lastname: "Dezezdzezoe",
  password: "Aa1&azaP",
};

const registerUser: RegisterUserProps = {
  email: user["email"],
  firstname: user["firstname"],
  lastname: user["lastname"],
  password: user["password"],
  confirmPassword: user["password"],
};

interface LoginUserProps {
  email: RegisterUserProps["email"];
  password: RegisterUserProps["password"];
}

const loginUser: LoginUserProps = {
  email: registerUser.email,
  password: registerUser.password,
};

const registerAdminUser: RegisterUserProps = {
  email: "admin@handymoov.com",
  firstname: user["firstname"],
  lastname: user["lastname"],
  password: user["password"],
  confirmPassword: user["password"],
};

const app = createServer();

describe("User", () => {
  afterEach(async () => {
    await PersonalizedAddress.destroy({ where: {} });
    await User.destroy({ where: { email: { [Op.notLike]: "%Test%" } } });
  });

  describe("POST /register", () => {
    it("should return 204 when registering a new user", async () => {
      const { statusCode } = await supertest(app)
        .post("/users/register")
        .send(registerUser);
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
    });

    describe("should return 409 if lastname or firstname is not the correct length", () => {
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

      describe(" should return 409 if email is not the correct length", () => {
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
  });

  describe("POST /login", () => {
    let token: string;
    beforeEach(async () => {
      await supertest(app).post("/users/register").send(registerUser);
    });
    it("should return a token and 200 if email and password are correct", async () => {
      const { statusCode, body } = await supertest(app)
        .post("/users/login")
        .send(loginUser);
      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("token");
    });

    describe("should return 401 if email or password is wrong", () => {
      it("email is wrong", async () => {
        const { statusCode, body } = await supertest(app)
          .post("/users/login")
          .send({ email: "lala@gmail.com", password: registerUser.password });
        expect(statusCode).toBe(401);
        expect(body).toEqual({
          param: ["email", "password"],
          msg: "Email ou mot de passe incorrect.",
        });
      });
      it("password is wrong", async () => {
        const { statusCode, body } = await supertest(app)
          .post("/users/login")
          .send({ email: registerUser.email, password: "987" });
        expect(statusCode).toBe(401);
        expect(body).toEqual({
          param: ["email", "password"],
          msg: "Email ou mot de passe incorrect.",
        });
      });
    });
  });
  describe("GET /", () => {
    it("should return 200 when get a user", async () => {
      await supertest(app).post("/users/register").send(registerUser);
      const res = await supertest(app).post("/users/login").send(loginUser);
      const { statusCode, body } = await supertest(app)
        .get("/users")
        .set("authorization", `${res.body.token}`);
      expect(statusCode).toBe(200);
      expect(body).toEqual({
        createdAt: expect.any(String),
        email: registerUser.email,
        firstname: registerUser.firstname,
        id: expect.any(Number),
        lastname: registerUser.lastname,
        modifiedAt: expect.any(String),
        password: expect.any(String),
        role: "user",
        updatedAt: expect.any(String),
      });
    });
  });
  describe("PUT /users", () => {
    let token: string;
    beforeEach(async () => {
      await supertest(app).post("/users/register").send(registerUser);
      const loginRes = await supertest(app)
        .post("/users/login")
        .send(loginUser);
      token = loginRes.body.token;
    });

    describe("should return 204 if update is valid", () => {
      it("update firstname", async () => {
        const { statusCode } = await supertest(app)
          .put("/users")
          .set("authorization", `${token}`)
          .send({ firstname: "bonjoru" });
        expect(statusCode).toBe(204);
      });
      it("update lastname", async () => {
        const { statusCode } = await supertest(app)
          .put("/users")
          .set("authorization", `${token}`)
          .send({ lastname: "bonjoru" });
        expect(statusCode).toBe(204);
      });
      it("update password", async () => {
        const newPassword = "123Aze9@ie";
        const { statusCode } = await supertest(app)
          .put("/users")
          .set("authorization", `${token}`)
          .send({
            password: newPassword,
            lastPassword: loginUser.password,
            confirmPassword: newPassword,
          });
        expect(statusCode).toBe(204);
      });
      it("update email", async () => {
        const newEmail = "newEmail@gmail.com";
        const { statusCode } = await supertest(app)
          .put("/users")
          .set("authorization", `${token}`)
          .send({
            email: newEmail,
            lastEmail: loginUser.email,
            confirmEmail: newEmail,
          });
        expect(statusCode).toBe(204);
      });
      // TODO it for birthday, picture, est handicapé ?
    });
    describe("missing with email", () => {
      it("should return 400 if last email is missing", async () => {
        const newEmail = "lala@gmail.com";
        const { statusCode, body } = await supertest(app)
          .put("/users")
          .set("authorization", `${token}`)
          .send({
            email: newEmail,
            confirmEmail: newEmail,
          });
        expect(statusCode).toBe(400);
        expect(body).toStrictEqual({
          param: ["lastEmail"],
          msg: "L'ancien email est obligatoire.",
        });
      });
      it("should return 400 if email is missing", async () => {
        const newEmail = "lala@gmail.com";
        const { statusCode, body } = await supertest(app)
          .put("/users")
          .set("authorization", `${token}`)
          .send({
            lastEmail: registerUser.email,
            confirmEmail: newEmail,
          });
        expect(statusCode).toBe(400);
        expect(body).toStrictEqual({
          param: ["email"],
          msg: "L'email est obligatoire.",
        });
      });
      it("should return 400 if confirm email is missing", async () => {
        const newEmail = "lala@gmail.com";
        const { statusCode, body } = await supertest(app)
          .put("/users")
          .set("authorization", `${token}`)
          .send({
            lastEmail: registerUser.email,
            email: newEmail,
          });
        expect(statusCode).toBe(400);
        expect(body).toStrictEqual({
          param: ["confirmEmail"],
          msg: "La confirmation d'email est obligatoire.",
        });
      });

      it("should return 409 if email already exists", async () => {
        const newUser: RegisterUserProps = {
          email: "newuser@gmail.com",
          password: "NewPass123EXIST!",
          firstname: "Neeew",
          lastname: "Useeer",
          confirmPassword: "NewPass123EXIST!",
        };
        await supertest(app).post("/users/register").send(newUser);

        const { statusCode, body } = await supertest(app)
          .put("/users")
          .set("authorization", `${token}`)
          .send({
            email: newUser.email,
            lastEmail: registerUser.email,
            confirmEmail: newUser.email,
          });

        expect(statusCode).toBe(409);
        expect(body).toStrictEqual({
          param: ["email"],
          msg: "Cet email existe déjà.",
        });
      });
      it("should return 400 if invalid last email", async () => {
        const newEmail = "newEmail@gmail.com";
        const { statusCode, body } = await supertest(app)
          .put("/users")
          .set("authorization", `${token}`)
          .send({
            email: newEmail,
            lastEmail: "wrongLastEmail@gmail.com",
            confirmEmail: newEmail,
          });

        expect(statusCode).toBe(400);
        expect(body).toStrictEqual({
          param: ["lastEmail"],
          msg: "Email incorrect.",
        });
      });

      it("should return 409 if email and confirm email mismatch", async () => {
        const newEmail = "newEmail@gmail.com";
        const { statusCode, body } = await supertest(app)
          .put("/users")
          .set("authorization", `${token}`)
          .send({
            email: newEmail,
            lastEmail: loginUser.email,
            confirmEmail: "mismatchEmail@gmail.com",
          });

        expect(statusCode).toBe(409);
        expect(body).toStrictEqual({
          param: ["confirmEmail"],
          msg: "Les emails ne sont pas identiques.",
        });
      });

      it("should return 400 if email being the same as last email", async () => {
        const { statusCode, body } = await supertest(app)
          .put("/users")
          .set("authorization", `${token}`)
          .send({
            email: loginUser.email,
            lastEmail: loginUser.email,
            confirmEmail: loginUser.email,
          });

        expect(statusCode).toBe(400);
        expect(body).toStrictEqual({
          param: ["email"],
          msg: "Le nouvel email est similaire à celui déjà enregistré.",
        });
      });
    });
    describe("missing with password", () => {
      it("should return 400 if invalid password format", async () => {
        const { statusCode, body } = await supertest(app)
          .put("/users")
          .set("authorization", `${token}`)
          .send({ password: "12345" });

        expect(statusCode).toBe(400);
        expect(body).toStrictEqual({
          msg: "Le mot de passe doit comporter plus de 7 caractères.",
          param: ["password"],
        });
      });

      it("should return 409 if invalid password mismatch", async () => {
        const newPassword = "NewPass123DIFFERENT!";
        const { statusCode, body } = await supertest(app)
          .put("/users")
          .set("authorization", `${token}`)
          .send({
            password: newPassword,
            confirmPassword: "DifferentPass123!",
            lastPassword: loginUser.password,
          });

        expect(statusCode).toBe(409);
        expect(body).toStrictEqual({
          msg: "Les mots de passe ne sont pas identiques.",
          param: ["confirmPassword"],
        });
      });
      it("should return 401 if invalid last password", async () => {
        const newPassword = "NewPass123WRONG!";
        const { statusCode, body } = await supertest(app)
          .put("/users")
          .set("authorization", `${token}`)
          .send({
            password: newPassword,
            confirmPassword: newPassword,
            lastPassword: "WrongPassword123!",
          });

        expect(statusCode).toBe(401);
        expect(body).toStrictEqual({
          msg: "Email ou mot de passe incorrect.",
          param: ["email", "password"],
        });
      });
    });

    describe("should return 409 if lastname or firstname is not the correct length", () => {
      it("fistname > 50 character", async () => {
        const { statusCode, body } = await supertest(app)
          .put("/users")
          .set("authorization", `${token}`)
          .send({
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
          .put("/users")
          .set("authorization", `${token}`)
          .send({ lastname: "123" });
        expect(statusCode).toBe(400);
        expect(body).toEqual({
          param: ["lastname"],
          msg: "Votre nom doit contenir entre 5 et 50 caractères.",
        });
      });

      it("fistname < 5 character", async () => {
        const { statusCode, body } = await supertest(app)
          .put("/users")
          .set("authorization", `${token}`)
          .send({ firstname: "123" });
        expect(statusCode).toBe(400);
        expect(body).toEqual({
          param: ["firstname"],
          msg: "Votre prénom doit contenir entre 5 et 50 caractères.",
        });
      });

      it("lastname > 50 character", async () => {
        const { statusCode, body } = await supertest(app)
          .put("/users")
          .set("authorization", `${token}`)
          .send({
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
  });
  describe("DELETE /users", () => {
    it("should delete user when user is found", async () => {
      // Ajoutez d'abord un utilisateur pour le supprimer ensuite
      await supertest(app).post("/users/register").send(registerUser);
      const loginRes = await supertest(app)
        .post("/users/login")
        .send(loginUser);
      const { statusCode } = await supertest(app)
        .delete("/users/")
        .set("authorization", `${loginRes.body.token}`);

      expect(statusCode).toBe(204);
    });

    it("should return 403 if token is missing", async () => {
      const deleteRes = await supertest(app).delete("/users");

      expect(deleteRes.status).toBe(403);
      expect(deleteRes.body).toEqual({
        message: "Accès interdit: token manquant",
      });
    });
  });
  describe("GET /users", () => {
    it("should return 200 and list of all users", async () => {
      await supertest(app).post("/users/register").send(registerUser);
      await supertest(app).post("/users/register").send(registerAdminUser);
      const adminLoginRes = await supertest(app).post("/users/login").send({
        email: "admin@handymoov.com",
        password: registerAdminUser["password"],
      });
      const { statusCode, body } = await supertest(app)
        .get("/users/all")
        .set("authorization", `${adminLoginRes.body.token}`);
      expect(statusCode).toBe(200);
      expect(body.length).toBeGreaterThan(0);
    });

    it("should return 403 when authenticated user is not admin", async () => {
      await supertest(app).post("/users/register").send(registerUser);
      const nonAdminLoginRes = await supertest(app)
        .post("/users/login")
        .send(loginUser);

      const { statusCode, body } = await supertest(app)
        .get("/users/all")
        .set("authorization", `${nonAdminLoginRes.body.token}`);

      // Vérifier que le statut de la réponse est 403 (interdit)
      expect(statusCode).toBe(403);
      expect(body).toEqual({
        message: "Accès interdit: rôle administrateur requis",
      });
    });
  });
});
