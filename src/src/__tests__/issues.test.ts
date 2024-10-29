import supertest from "supertest";

import { Op } from "sequelize";
import createServer from "../utils/server";
import User from "../models/userModel";
import { loginUser, registerUser } from "./users/usersConst";
import Issue from "../models/issueModel";
import CurrentIssue from "../models/currentIssue";

const app = createServer();
interface IssuesProps {
  label: string;
  gpsCoordinateLat: number;
  gpsCoordinateLng: number;
}
const issuePost: IssuesProps = {
  label: "Trottoire trop haut",
  gpsCoordinateLat: 48.8566,
  gpsCoordinateLng: 2.3522,
};
interface CurrentIssuesProps {
  issue_id: number;
  actif: boolean;
}

describe("Issues", () => {
  let token: string;
  beforeEach(async () => {
    await supertest(app).post("/users/register").send(registerUser);
    const loginRes = await supertest(app).post("/users/login").send(loginUser);
    token = loginRes.body.token;
  });

  afterEach(async () => {
    await CurrentIssue.destroy({ where: {} });
    await Issue.destroy({ where: {} });
    await User.destroy({ where: { email: { [Op.notLike]: "%test%" } } });
  });
  // afterAll(async () => {});

  describe("POST /issues ", () => {
    it("should return 200 if reussit", async () => {
      const { statusCode } = await supertest(app)
        .post("/issues")
        .set("authorization", token)
        .send(issuePost);
      expect(statusCode).toBe(200);
    });
    describe("should return 404 if label or gpsCoordinateLat or gpsCoordinateLng is missing ", () => {
      it("label is missing", async () => {
        const { label, ...missing } = issuePost;
        const { statusCode, body } = await supertest(app)
          .post("/issues")
          .set("authorization", token)
          .send(missing);

        expect(statusCode).toBe(404);
        expect(body).toEqual({ msg: "Label obligatoire" });
      });
      it("longitude is missing", async () => {
        const { gpsCoordinateLng, ...missing } = issuePost;
        const { statusCode, body } = await supertest(app)
          .post("/issues")
          .set("authorization", token)
          .send(missing);

        expect(statusCode).toBe(404);
        expect(body).toEqual({ msg: "Coordonées obligatoire" });
      });
      it("latitude is missing", async () => {
        const { gpsCoordinateLat, ...missing } = issuePost;
        const { statusCode, body } = await supertest(app)
          .post("/issues")
          .set("authorization", token)
          .send(missing);

        expect(statusCode).toBe(404);
        expect(body).toEqual({ msg: "Coordonées obligatoire" });
      });
    });
  });
  describe("GET All /issues", () => {
    it("should return 200 if reussit", async () => {
      await supertest(app)
        .post("/issues")
        .set("authorization", token)
        .send(issuePost);
      const { statusCode, body } = await supertest(app)
        .get("/issues")
        .set("authorization", token);
      expect(statusCode).toBe(200);
      expect(body).toEqual(
        expect.arrayContaining([
          {
            actif: true || false,
            createdAt: expect.any(String),
            modifiedAt: expect.any(String),
            gpsCoordinateLat: expect.any(String),
            gpsCoordinateLng: expect.any(String),
            id: expect.any(Number),
            label: expect.any(String),
            updatedAt: expect.any(String),
            user_id: expect.any(Number),
          },
        ])
      );
    });
    it("should return 404 if not issues", async () => {
      const { statusCode, body } = await supertest(app)
        .get("/issues")
        .set("authorization", token);

      expect(statusCode).toBe(404);
      expect(body).toEqual({ msg: "Aucune issues trouvés" });
    });
  });

  describe("GET /issues/actif", () => {
    it("should return 200 if reussit", async () => {
      await supertest(app)
        .post("/issues")
        .set("authorization", token)
        .send(issuePost);
      const { statusCode, body } = await supertest(app)
        .get("/issues/actif")
        .set("authorization", token);
      console.error(body);
      expect(statusCode).toBe(200);
      expect(body).toEqual(
        expect.arrayContaining([
          {
            actif: true,
            createdAt: expect.any(String),
            modifiedAt: expect.any(String),
            gpsCoordinateLat: expect.any(String),
            gpsCoordinateLng: expect.any(String),
            id: expect.any(Number),
            label: expect.any(String),
            updatedAt: expect.any(String),
            user_id: expect.any(Number),
          },
        ])
      );
    });
    it("should return 404 if not issues", async () => {
      const { statusCode, body } = await supertest(app)
        .get("/issues/actif")
        .set("authorization", token);

      expect(statusCode).toBe(404);
      expect(body).toEqual({ msg: "Aucune issues trouvées." });
    });
  });
  describe("GET /issues/single/:issue_id", () => {
    it("should return 200 if reussit", async () => {
      await supertest(app)
        .post("/issues")
        .set("authorization", token)
        .send(issuePost);
      const allIssues = await supertest(app)
        .get("/issues")
        .set("authorization", token);
      const { statusCode, body } = await supertest(app)
        .get(`/issues/single/${allIssues.body[0].id}`)
        .set("authorization", token);

      expect(statusCode).toBe(200);
      expect(body).toEqual({
        actif: true || false,
        createdAt: expect.any(String),
        modifiedAt: expect.any(String),
        gpsCoordinateLat: expect.any(String),
        gpsCoordinateLng: expect.any(String),
        id: expect.any(Number),
        label: expect.any(String),
        updatedAt: expect.any(String),
        user_id: expect.any(Number),
      });
    });
    it("should return 404 if not issues", async () => {
      const { statusCode, body } = await supertest(app)
        .get("/issues/single/3")
        .set("authorization", token);

      expect(statusCode).toBe(404);
      expect(body).toEqual({ msg: "Issue non trouvée." });
    });
  });
  // describe("GET /issues/user", () => {
  //   it("should return 200 if reussit", async () => {
  //     // await supertest(app)
  //     //   .post("/issues")
  //     //   .set("authorization", token)
  //     //   .send(issuePost);
  //     const { statusCode, body } = await supertest(app)
  //       .get("/issues")
  //       .set("authorization", token);
  //     expect(statusCode).toBe(200);
  //     // expect(body).toEqual(
  //     //   expect.arrayContaining([
  //     //     {
  //     //       actif: true || false,
  //     //       createdAt: expect.any(String),
  //     //       modifiedAt: expect.any(String),
  //     //       gpsCoordinateLat: expect.any(String),
  //     //       gpsCoordinateLng: expect.any(String),
  //     //       id: expect.any(Number),
  //     //       label: expect.any(String),
  //     //       updatedAt: expect.any(String),
  //     //       user_id: expect.any(Number),
  //     //     },
  //     //   ])
  //     // );
  //   });
  // });
  describe("POST /issues/currentIssue", () => {
    describe("should return 200 if reussit", () => {
      it("is actif", async () => {
        await supertest(app)
          .post("/issues")
          .set("authorization", token)
          .send(issuePost);
        const allIssues = await supertest(app)
          .get("/issues")
          .set("authorization", token);
        const isActif: CurrentIssuesProps = {
          issue_id: allIssues.body[0].id,
          actif: true,
        };
        const { statusCode, body } = await supertest(app)
          .post(`/issues/currentIssue`)
          .set("authorization", token)
          .send(isActif);
        console.error(body);
        expect(statusCode).toBe(200);
      });
      it("isn't actif", async () => {
        await supertest(app)
          .post("/issues")
          .set("authorization", token)
          .send(issuePost);
        const allIssues = await supertest(app)
          .get("/issues")
          .set("authorization", token);
        const isActif: CurrentIssuesProps = {
          issue_id: allIssues.body[0].id,
          actif: false,
        };
        const { statusCode } = await supertest(app)
          .post(`/issues/currentIssue`)
          .set("authorization", token)
          .send(isActif);

        expect(statusCode).toBe(200);
      });
    });
    describe("should return 404 if information is missing", () => {
      it("issue_id is missing", async () => {
        const isActif = {
          actif: true,
        };
        const { statusCode, body } = await supertest(app)
          .post("/issues/currentIssue")
          .set("authorization", token)
          .send(isActif);

        expect(statusCode).toBe(404);
        expect(body).toEqual({ msg: "Id de l'issue obligatoire." });
      });
      it("actif is missing", async () => {
        await supertest(app)
          .post("/issues")
          .set("authorization", token)
          .send(issuePost);
        const allIssues = await supertest(app)
          .get("/issues")
          .set("authorization", token);
        const isActif = {
          issue_id: allIssues.body[0].id,
        };
        const { statusCode, body } = await supertest(app)
          .post("/issues/currentIssue")
          .set("authorization", token)
          .send(isActif);

        expect(statusCode).toBe(404);
        expect(body).toEqual({ msg: "Actif obligatoire." });
      });
    });
    it("should return 404 if issue doesn't exist", async () => {
      const isActif: CurrentIssuesProps = {
        issue_id: 1,
        actif: true,
      };
      const { statusCode, body } = await supertest(app)
        .post(`/issues/currentIssue`)
        .set("authorization", token)
        .send(isActif);

      expect(statusCode).toBe(404);
      expect(body).toEqual({ msg: "L'issue n'existe pas." });
    });
  });
});
