import supertest from "supertest";
import createServer from "../utils/server";
import User from "../models/userModel";
import PersonalizedAddress from "../models/personalizedAddress";
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
  passwordConfirmation: string;
}
let user: UserProps = {
  email: "register@example.com",
  firstname: "Jedzeddeohn",
  lastname: "Dezezdezoe",
  password: "12zaaz3",
};
const registerUser: RegisterUserProps = {
  email: user["email"],
  firstname: user["firstname"],
  lastname: user["lastname"],
  password: user["password"],
  passwordConfirmation: user["password"],
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
  passwordConfirmation: user["password"],
};
const app = createServer();

describe("User", () => {
  afterEach(async () => {
    await PersonalizedAddress.destroy({ where: {} });
    await User.destroy({ where: { email: registerUser.email } });
    await User.destroy({
      where: { email: registerAdminUser.email || "invalidemail" },
    });
  });

  describe("POST /register", () => {
    it("should return 204 when registering a new user", async () => {
      const response = await supertest(app)
        .post("/users/register")
        .send(registerUser);
      expect(response.status).toBe(204);
    });

    describe("should return 400 if information is missing", () => {
      it("email is missing", async () => {
        const { email, ...inputUser } = registerUser;
        const { statusCode, body } = await supertest(app)
          .post("/users/register")
          .send(inputUser);

        expect(statusCode).toBe(400);
        expect(body).toEqual({
          errors: [
            {
              location: "body",
              msg: "Invalid value",
              path: "email",
              type: "field",
              value: "",
            },
            {
              location: "body",
              msg: "Invalid value",
              path: "email",
              type: "field",
              value: "",
            },
            {
              location: "body",
              msg: "L'email est obligatoire et doit être une adresse email valide",
              path: "email",
              type: "field",
              value: "",
            },
          ],
        });
      });

      it("firstname is missing", async () => {
        const { firstname, ...inputUser } = registerUser;
        const { statusCode, body } = await supertest(app)
          .post("/users/register")
          .send(inputUser);
        expect(statusCode).toBe(400);
        expect(body).toEqual({
          errors: [
            {
              location: "body",
              msg: "Invalid value",
              path: "firstname",
              type: "field",
              value: "",
            },
            {
              location: "body",
              msg: "Invalid value",
              path: "firstname",
              type: "field",
              value: "",
            },
            {
              location: "body",
              msg: "Le prénom est obligatoire",
              path: "firstname",
              type: "field",
              value: "",
            },
          ],
        });
      });

      it("lastname is missing", async () => {
        const { lastname, ...inputUser } = registerUser;
        const { statusCode, body } = await supertest(app)
          .post("/users/register")
          .send(inputUser);
        expect(statusCode).toBe(400);
        expect(body).toEqual({
          errors: [
            {
              location: "body",
              msg: "Invalid value",
              path: "lastname",
              type: "field",
              value: "",
            },
            {
              location: "body",
              msg: "Invalid value",
              path: "lastname",
              type: "field",
              value: "",
            },
            {
              location: "body",
              msg: "Le nom est obligatoire",
              path: "lastname",
              type: "field",
              value: "",
            },
          ],
        });
      });
    });

    it("should return 409 if password is different from confirmPassword", async () => {
      const { statusCode, body } = await supertest(app)
        .post("/users/register")
        .send({ ...registerUser, passwordConfirmation: "123" });
      expect(statusCode).toBe(409);
      expect(body).toEqual({
        message: "Les mots de passe ne sont pas identiques",
      });
    });

    it("should return 409 if duplicate email", async () => {
      await supertest(app).post("/users/register").send(registerUser);
      const { statusCode, body } = await supertest(app)
        .post("/users/register")
        .send(registerUser);
      expect(statusCode).toBe(409);
      expect(body).toEqual({ message: "Cet email existe déjà." });
    });
  });

  describe("POST /login", () => {
    it("should return a token and 200 if email and password are correct", async () => {
      await supertest(app).post("/users/register").send(registerUser);
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
        expect(body).toEqual({ message: "Email ou mot de passe incorrect." });
      });
      it("password is wrong", async () => {
        await User.create({
          email: registerUser.email,
          firstname: registerUser.firstname,
          lastname: registerUser.lastname,
          password: registerUser.password,
        });
        const { statusCode, body } = await supertest(app)
          .post("/users/login")
          .send({ email: registerUser.email, password: "987" });
        expect(statusCode).toBe(401);
        expect(body).toEqual({ message: "Email ou mot de passe incorrect." });
      });
    });
  });
  describe("GET /", () => {
    it("should return 200 when get a user", async () => {
      // inscription
      await supertest(app).post("/users/register").send(registerUser);
      // connexion
      const res = await supertest(app).post("/users/login").send(loginUser);
      // test
      const { statusCode, body } = await supertest(app)
        .get("/users")
        .set("authorization", `${res.body.token}`);
      expect(statusCode).toBe(200);
      expect(body).toEqual({
        createdAt: expect.any(String),
        email: "register@example.com",
        firstname: "Jedzeddeohn",
        id: expect.any(Number),
        lastname: "Dezezdezoe",
        modifiedAt: expect.any(String),
        password: expect.any(String),
        role: "user",
        updatedAt: expect.any(String),
      });
    });
  });
  describe("PUT /users", () => {
    it("should update user when user is found and data is valid", async () => {
      // Préparation : Créer un utilisateur
      await supertest(app).post("/users/register").send(registerUser);
      const loginRes = await supertest(app)
        .post("/users/login")
        .send(loginUser);

      // Action : Mettre à jour l'utilisateur
      // TODO : RAJOUTER l'email (problème actuellement si email = 500)
      const updateRes = await supertest(app)
        .put("/users")
        .set("authorization", `${loginRes.body.token}`)
        .send({ firstname: "bonjoru", lastname: "lala", password: "short" });

      // Vérification : Assurez-vous que la mise à jour s'est bien déroulée
      expect(updateRes.status).toBe(204);
    });

    it("should return 400 if invalid data is provided", async () => {
      // Préparation : Créer un utilisateur
      await supertest(app).post("/users/register").send(registerUser);
      const loginRes = await supertest(app)
        .post("/users/login")
        .send(loginUser);

      // Action : Tenter de mettre à jour l'utilisateur avec des données invalides
      const updateRes = await supertest(app)
        .put("/users")
        .set("authorization", `${loginRes.body.token}`)
        .send({ email: "invalidemail", password: "short" });

      // Vérification : Assurez-vous que la réponse indique des données invalides
      expect(updateRes.status).toBe(400);
      expect(updateRes.body).toEqual({
        errors: [
          {
            location: "body",
            msg: "Invalid value",
            path: "email",
            type: "field",
            value: expect.any(String),
          },
        ],
      }); // Assurez-vous que deux erreurs sont retournées
    });

    it("should not update non-provided fields", async () => {
      // Préparation : Créer un utilisateur
      await supertest(app).post("/users/register").send(registerUser);
      const loginRes = await supertest(app)
        .post("/users/login")
        .send(loginUser);

      // Action : Tenter de mettre à jour l'utilisateur sans fournir certains champs
      const updateRes = await supertest(app)
        .put("/users")
        .set("authorization", `${loginRes.body.token}`)
        .send({});

      // Vérification : Assurez-vous que la mise à jour ne modifie pas les champs non fournis
      expect(updateRes.status).toBe(204);

      // Vérifiez que les champs non fournis n'ont pas été modifiés
      const { body } = await supertest(app)
        .get("/users/")
        .set("authorization", `${loginRes.body.token}`);

      expect(body.email).toBe(loginUser.email);
      expect(body.firstname).toBe(registerUser.firstname);
      expect(body.lastname).toBe(registerUser.lastname);
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
