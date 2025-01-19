import supertest from "supertest";
import { Op } from "sequelize";
import User from "../../models/userModel";
import { registerUser } from "./usersConst";
import createServer from "../../utils/server";

const app = createServer();

describe("User POST /users/register", () => {
  afterEach(async () => {
    await User.destroy({ where: { email: { [Op.notLike]: "%test%" } } });
  });

  it("should return 204 when registering a new user", async () => {
    const { statusCode, body } = await supertest(app)
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
      expect(body.errors).toEqual([
        {
          location: "body",
          msg: "Email invalide",
          path: "email",
          type: "field",
          value: "",
        },
      ]);
    });

    it("firstname is missing", async () => {
      const { firstname, ...inputUser } = registerUser;
      const { statusCode, body } = await supertest(app)
        .post("/users/register")
        .send(inputUser);
      expect(statusCode).toBe(400);
      expect(body.errors).toEqual([
        {
          location: "body",
          msg: "Le prénom est requis",
          path: "firstname",
          type: "field",
          value: "",
        },
      ]);
    });

    it("lastname is missing", async () => {
      const { lastname, ...inputUser } = registerUser;
      const { statusCode, body } = await supertest(app)
        .post("/users/register")
        .send(inputUser);
      expect(statusCode).toBe(400);
      expect(body.errors).toEqual([
        {
          location: "body",
          msg: "Le nom est requis",
          path: "lastname",
          type: "field",
          value: "",
        },
      ]);
    });

    it("birthday is missing", async () => {
      const { birthday, ...inputUser } = registerUser;
      const { statusCode, body } = await supertest(app)
        .post("/users/register")
        .send(inputUser);

      expect(statusCode).toBe(400);
      expect(body.errors).toEqual([
        {
          location: "body",
          msg: "La date de naissance est requise",
          path: "birthday",
          type: "field",
          value: "",
        },
        {
          location: "body",
          msg: "Date de naissance invalide",
          path: "birthday",
          type: "field",
          value: "",
        },
      ]);
    });
  });

  it("should return 400 if email format is invalid", async () => {
    const response = await supertest(app)
      .post("/users/register")
      .send({ ...registerUser, email: "invalidemail" });

    expect(response.statusCode).toBe(400);
    expect(response.body.errors).toEqual([
      {
        location: "body",
        msg: "Email invalide",
        path: "email",
        type: "field",
        value: "invalidemail",
      },
    ]);
  });

  it("should return 400 if the email part before '@' is too long", async () => {
    const response = await supertest(app)
      .post("/users/register")
      .send({
        ...registerUser,
        email: `${"a".repeat(42)}@example.com`,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.errors).toEqual([
      {
        location: "body",
        msg: "La partie avant le '@' de l'email est trop longue.",
        path: "email",
        type: "field",
        value: `${"a".repeat(42)}@example.com`,
      },
    ]);
  });

  // it("should return 400 if password is less than 7 characters", async () => {
  //   const inputUser = {
  //     ...registerUser,
  //     password: "Pass1erroaore!",
  //     confirmPassword: "Pass1erroaore!",
  //   };
  //   const { statusCode, body } = await supertest(app)
  //     .post("/users/register")
  //     .send(inputUser);

  //   expect(statusCode).toBe(400);
  //   expect(body.errors).toEqual([
  //     {
  //       location: "body",
  //       msg: "Le mot de passe doit contenir au moins 7 caractères",
  //       path: "password",
  //       type: "field",
  //       value: "Pass1erroaore!",
  //     },
  //   ]);
  // });

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
    expect(body.errors).toEqual([
      {
        location: "body",
        msg: "Le mot de passe doit contenir au moins une lettre majuscule",
        path: "password",
        type: "field",
        value: "password1!",
      },
    ]);
  });

  it("should return 400 if birthday is not valid", async () => {
    const { statusCode, body } = await supertest(app)
      .post("/users/register")
      .send({ ...registerUser, birthday: "invalid-birthday" });

    expect(statusCode).toBe(400);
    expect(body).toEqual({
      errors: [
        {
          location: "body",
          msg: "Date de naissance invalide",
          path: "birthday",
          type: "field",
          value: "invalid-birthday",
        },
      ],
    });
  });

  it("should return 400 if user is under 18 years old", async () => {
    const under18Birthday = new Date();
    under18Birthday.setFullYear(under18Birthday.getFullYear() - 17);
    under18Birthday.setDate(under18Birthday.getDate() + 1);
    const { statusCode, body } = await supertest(app)
      .post("/users/register")
      .send({ ...registerUser, birthday: under18Birthday.toISOString() });

    expect(statusCode).toBe(400);
    expect(body).toEqual({
      errors: [
        {
          location: "body",
          msg: "Date de naissance invalide",
          path: "birthday",
          type: "field",
          value: expect.stringMatching(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
          ),
        },
      ],
    });
  });

  it("should return 400 if CGU is not accepted", async () => {
    const { statusCode, body } = await supertest(app)
      .post("/users/register")
      .send({ ...registerUser, cgu: false });

    expect(statusCode).toBe(400);
    expect(body).toEqual({
      errors: [
        {
          location: "body",
          msg: "Vous devez accepter les CGU",
          path: "cgu",
          type: "field",
          value: "",
        },
      ],
    });
  });
});
