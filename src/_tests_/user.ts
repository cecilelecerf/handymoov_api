import supertest from "supertest";
import User from "../models/userModel";
import { app } from "../src/app";
describe("user", () => {
  describe("get newsletter route", () => {
    beforeEach(() => {
      app;
    });
    afterEach(() => {
      app.close();
      User.destroy({ truncate: true });
    });
  });
});
