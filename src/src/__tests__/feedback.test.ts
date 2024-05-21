import { createServer } from "http";
import supertest from "supertest";
import PersonalizedAddress from "../models/personalizedAddress";
import User from "../models/userModel";
import ObjectFeedback from "../models/objectFeedbackModel";

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
  email: "feedback@example.com",
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
let tokenUser: string;
let objectFeedback: ObjectFeedback;
describe("Feedback", () => {
  beforeAll(async () => {
    try {
      await User.create(user);
      objectFeedback = await ObjectFeedback.create({ label: "Bonjour" });
    } catch (error) {
      console.error(error);
    }
  });
  afterAll(async () => {
    await ObjectFeedback.destroy({ where: {} });
    await PersonalizedAddress.destroy({ where: {} });
    await User.destroy({ where: { email: user.email } });
  });
  describe("POST /feedbacks", () => {
    it("should retourn 204 if post feedbacks", async () => {
      console.log(objectFeedback.label);
      // const tokenRes = await supertest(app)
      //   .post("/users/login")
      //   .send(loginUser);
      const { statusCode, body } = await supertest(app)
        .post("/feedbacks")
        .set("authorization", tokenRes.body.token)
        .send({ object: objectFeedback.label, description: "oer,ogrejo" });
      console.log(statusCode);
      expect(statusCode).toBe(204);
      expect(body).toEqual({ message: "repkfrefpk" });
    });
    // describe("should retourn 400 if information is missing", () => {
    //   it("object is missing", async () => {
    //     const tokenRes = await supertest(app)
    //       .post("/users/login")
    //       .send(loginUser);
    //     tokenUser = tokenRes.body.token;
    //     const { statusCode, body } = await supertest(app)
    //       .post("/feedbacks")
    //       .set("authorization", tokenUser)
    //       .send({ describe: "neojerjeorgjregjoi" });
    //     expect(statusCode).toBe(400);
    //     expect(body).toEqual("eorjfo");
    //   }, 10000);
    // });
  });
});
