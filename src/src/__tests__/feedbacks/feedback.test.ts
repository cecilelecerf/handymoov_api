import supertest from "supertest";

import { Op } from "sequelize";
import createServer from "../../utils/server";
import User from "../../models/userModel";
import {
  UserProps,
  loginAdminUser,
  loginUser,
  registerAdminUser,
  registerUser,
} from "../users/usersConst";
import Feedback from "../../models/feedbackModel";
import ObjectFeedback from "../../models/objectFeedbackModel";

const app = createServer();
interface ObjectFeedbackProps {
  label: string;
  icon: string;
}

interface FeedbacksProps {
  object: ObjectFeedbackProps["label"];
  title: string;
  description: string;
  user_id: number;
  read: boolean;
  hightPriority: boolean;
}

interface FeedbackPostProps {
  object: FeedbacksProps["object"];
  title: FeedbacksProps["title"];
  description: FeedbacksProps["description"];
}

describe("Feedbacks", () => {
  let token: string;
  let tokenAdmin: string;
  let postAFeedback: FeedbackPostProps;
  let objectFeedback: string;
  beforeAll(async () => {
    await supertest(app).post("/users/register").send(registerUser);
    const loginRes = await supertest(app).post("/users/login").send(loginUser);
    token = loginRes.body.token;
    await supertest(app).post("/users/register").send(registerAdminUser);
    const loginAdminRes = await supertest(app)
      .post("/users/login")
      .send(loginAdminUser);
    tokenAdmin = loginAdminRes.body.token;
  });
  beforeEach(async () => {
    const allObjectFeedback = await supertest(app)
      .get("/feedbacks/object")
      .set("authorization", token);
    console.log("tata");
    console.log(allObjectFeedback.body);
    console.log("line");
    objectFeedback = allObjectFeedback.body[0].label;
    postAFeedback = {
      object: objectFeedback,
      title: "Problème de géolocalisation",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in .",
    };
  });
  afterEach(async () => {
    await ObjectFeedback.destroy({ where: { label: "lala" } });
    await ObjectFeedback.destroy({ where: { label: "Feature Request" } });
    await Feedback.destroy({ where: {} });
  });
  afterAll(async () => {
    await User.destroy({ where: { email: { [Op.notLike]: "%test%" } } });
  });
  describe("POST /feedbacks ", () => {
    it("should return 201 if reussit", async () => {
      const { statusCode, body } = await supertest(app)
        .post("/feedbacks")
        .set("authorization", token)
        .send(postAFeedback);
      expect(statusCode).toBe(201);
      expect(body).toEqual({
        createdAt: expect.any(String),
        modifiedAt: expect.any(String),
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in .",
        title: "Problème de géolocalisation",
        object: objectFeedback,
        user_id: expect.any(Number),
        read: false,
        hightPriority: false,
        id: expect.any(Number),
        updatedAt: expect.any(String),
      });
    });
    describe("should return 400 if information is missing", () => {
      it("object is missing", async () => {
        const postAFeedback = {
          title: "Problème de géolocalisation",
          description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in .",
        };
        const { statusCode, body } = await supertest(app)
          .post("/feedbacks")
          .set("authorization", token)
          .send(postAFeedback);
        expect(statusCode).toBe(400);
        expect(body).toEqual({
          param: ["object"],
          msg: "L'objet est obligatoire.",
        });
      });
      it("title is missing", async () => {
        const allObjectFeedback = await supertest(app)
          .get("/feedbacks/object")
          .set("authorization", token);
        const postAFeedback = {
          object: allObjectFeedback.body[0].label,
          description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in .",
        };
        const { statusCode, body } = await supertest(app)
          .post("/feedbacks")
          .set("authorization", token)
          .send(postAFeedback);
        expect(statusCode).toBe(400);
        expect(body).toEqual({
          param: ["title"],
          msg: "Le titre est obligatoire.",
        });
      });
      it("description is missing", async () => {
        const allObjectFeedback = await supertest(app)
          .get("/feedbacks/object")
          .set("authorization", token);
        const postAFeedback = {
          object: allObjectFeedback.body[0].label,
          title: "Problème de géolocalisation",
        };
        const { statusCode, body } = await supertest(app)
          .post("/feedbacks")
          .set("authorization", token)
          .send(postAFeedback);
        expect(statusCode).toBe(400);
        expect(body).toEqual({
          param: ["description"],
          msg: "La description est obligatoire.",
        });
      });
    });
    describe("should return 400 if information is not a good length", () => {
      it("title.length >= 100", async () => {
        const allObjectFeedback = await supertest(app)
          .get("/feedbacks/object")
          .set("authorization", token);
        const postAFeedback: FeedbackPostProps = {
          object: allObjectFeedback.body[0].label,
          title:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in .",
          description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in .",
        };
        const { statusCode, body } = await supertest(app)
          .post("/feedbacks")
          .set("authorization", token)
          .send(postAFeedback);
        expect(statusCode).toBe(400);
        expect(body).toEqual({
          param: ["title"],
          msg: "Le titre doit faire 100 caractères maximum.",
        });
      });
      it("description.length >= 1000", async () => {
        const allObjectFeedback = await supertest(app)
          .get("/feedbacks/object")
          .set("authorization", token);
        const postAFeedback: FeedbackPostProps = {
          object: allObjectFeedback.body[0].label,
          title: "Problème de géolocalisation",
          description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in .Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in .Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in .Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in .Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in .",
        };
        const { statusCode, body } = await supertest(app)
          .post("/feedbacks")
          .set("authorization", token)
          .send(postAFeedback);
        expect(statusCode).toBe(400);
        expect(body).toEqual({
          param: ["description"],
          msg: "La description doit faire 1000 caractères maximum.",
        });
      });
    });
    it("should return 400 if object doesn't exist", async () => {
      const postAFeedback: FeedbackPostProps = {
        object: "Lorem ipsum dolor sit amet",
        title: "Problème de géolocalisation",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in .",
      };
      const { statusCode, body } = await supertest(app)
        .post("/feedbacks")
        .set("authorization", token)
        .send(postAFeedback);
      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["object"],
        msg: "Vous devez utiliser un objet prédéfini.",
      });
    });
  });
  describe("GET ALL /feedbacks", () => {
    it("should retrun 200 if is good", async () => {
      await supertest(app)
        .post("/feedbacks")
        .set("authorization", token)
        .send(postAFeedback);
      await supertest(app)
        .post("/feedbacks")
        .set("authorization", token)
        .send(postAFeedback);
      const { statusCode, body } = await supertest(app)
        .get("/feedbacks")
        .set("authorization", token);
      expect(statusCode).toBe(200);
      expect(body).toEqual(
        expect.arrayContaining([
          {
            createdAt: expect.any(String),
            modifiedAt: expect.any(String),
            description:
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in .",
            title: "Problème de géolocalisation",
            object: objectFeedback,
            user_id: expect.any(Number),
            read: false,
            hightPriority: false,
            id: expect.any(Number),
            updatedAt: expect.any(String),
          },
        ])
      );
    });
    it("should returns 404 if there is no feedback", async () => {
      const { statusCode, body } = await supertest(app)
        .get("/feedbacks")
        .set("authorization", token);
      expect(statusCode).toBe(404);
      expect(body).toEqual({ msg: "Aucun feedbacks trouvés." });
    });
  });
  describe("GET /single/:feedback_id", () => {
    it("should return 200 if is valid", async () => {
      const post = await supertest(app)
        .post("/feedbacks")
        .set("authorization", token)
        .send(postAFeedback);
      const { statusCode, body } = await supertest(app)
        .get(`/feedbacks/single/${post.body.id}`)
        .set("authorization", tokenAdmin);
      expect(statusCode).toBe(200);
      expect(body).toEqual({
        createdAt: expect.any(String),
        modifiedAt: expect.any(String),
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in .",
        title: "Problème de géolocalisation",
        object: objectFeedback,
        user_id: expect.any(Number),
        read: false,
        hightPriority: false,
        id: expect.any(Number),
        updatedAt: expect.any(String),
      });
    });
    it("should return 404 if feedback doesn't exist", async () => {
      const post = await supertest(app)
        .post("/feedbacks")
        .set("authorization", token)
        .send(postAFeedback);
      const { statusCode, body } = await supertest(app)
        .get(`/feedbacks/single/100`)
        .set("authorization", tokenAdmin);
      expect(statusCode).toBe(404);
      expect(body).toEqual({ msg: "Feedback non trouvée." });
    });
  });
  describe("PUT /feedbacks/single/:feedback_id", () => {
    it("should return 200 if successful", async () => {
      const post = await supertest(app)
        .post("/feedbacks")
        .set("authorization", tokenAdmin)
        .send(postAFeedback);

      const updatedFeedback = {
        object: post.body.object,
        title: "Titre mis à jour",
        description: "Description mise à jour",
        read: true,
        hightPriority: true,
      };

      const { statusCode, body } = await supertest(app)
        .put(`/feedbacks/single/${post.body.id}`)
        .set("authorization", tokenAdmin)
        .send(updatedFeedback);
      console.error(body);
      expect(statusCode).toBe(200);
    });

    it("should return 404 if feedback doesn't exist", async () => {
      const updatedFeedback = {
        object: objectFeedback,
        title: "Titre mis à jour",
        description: "Description mise à jour",
        read: true,
        hightPriority: true,
      };

      const { statusCode, body } = await supertest(app)
        .put(`/feedbacks/single/1000`)
        .set("authorization", tokenAdmin)
        .send(updatedFeedback);
      console.error(body);

      expect(statusCode).toBe(404);
      expect(body).toEqual({ msg: "Feedback non trouvée." });
    });

    it("should return 400 if object is missing", async () => {
      const post = await supertest(app)
        .post("/feedbacks")
        .set("authorization", token)
        .send(postAFeedback);

      const updatedFeedback = {
        title: "Titre mis à jour",
        description: "Description mise à jour",
        read: true,
        hightPriority: true,
      };

      const { statusCode, body } = await supertest(app)
        .put(`/feedbacks/single/${post.body.id}`)
        .set("authorization", tokenAdmin)
        .send(updatedFeedback);

      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["object"],
        msg: "L'objet est obligatoire.",
      });
    });

    it("should return 400 if title is missing", async () => {
      const post = await supertest(app)
        .post("/feedbacks")
        .set("authorization", token)
        .send(postAFeedback);

      const updatedFeedback = {
        object: post.body.object,
        description: "Description mise à jour",
        read: true,
        hightPriority: true,
      };

      const { statusCode, body } = await supertest(app)
        .put(`/feedbacks/single/${post.body.id}`)
        .set("authorization", tokenAdmin)
        .send(updatedFeedback);

      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["title"],
        msg: "Le titre est obligatoire.",
      });
    });

    it("should return 400 if description is missing", async () => {
      const post = await supertest(app)
        .post("/feedbacks")
        .set("authorization", token)
        .send(postAFeedback);

      const updatedFeedback = {
        object: post.body.object,
        title: "Titre mis à jour",
        read: true,
        hightPriority: true,
      };

      const { statusCode, body } = await supertest(app)
        .put(`/feedbacks/single/${post.body.id}`)
        .set("authorization", tokenAdmin)
        .send(updatedFeedback);

      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["description"],
        msg: "La description est obligatoire.",
      });
    });

    it("should return 400 if read is missing", async () => {
      const post = await supertest(app)
        .post("/feedbacks")
        .set("authorization", token)
        .send(postAFeedback);

      const updatedFeedback = {
        object: post.body.object,
        title: "Titre mis à jour",
        description: "Description mise à jour",
        hightPriority: true,
      };

      const { statusCode, body } = await supertest(app)
        .put(`/feedbacks/single/${post.body.id}`)
        .set("authorization", tokenAdmin)
        .send(updatedFeedback);

      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["read"],
        msg: "Savoir si le feedback a été lu est obligatoire.",
      });
    });

    it("should return 400 if hightPriority is missing", async () => {
      const post = await supertest(app)
        .post("/feedbacks")
        .set("authorization", token)
        .send(postAFeedback);

      const updatedFeedback = {
        object: post.body.object,
        title: "Titre mis à jour",
        description: "Description mise à jour",
        read: true,
      };

      const { statusCode, body } = await supertest(app)
        .put(`/feedbacks/single/${post.body.id}`)
        .set("authorization", tokenAdmin)
        .send(updatedFeedback);

      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["hightPriority"],
        msg: "Savoir si le feedback est prioritaire est obligatoire.",
      });
    });

    it("should return 400 if title length is >= 100", async () => {
      const post = await supertest(app)
        .post("/feedbacks")
        .set("authorization", token)
        .send(postAFeedback);

      const updatedFeedback = {
        object: post.body.object,
        title:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in Lorem ipsum dolor sit amet.",
        description: "Description mise à jour",
        read: true,
        hightPriority: true,
      };

      const { statusCode, body } = await supertest(app)
        .put(`/feedbacks/single/${post.body.id}`)
        .set("authorization", tokenAdmin)
        .send(updatedFeedback);

      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["title"],
        msg: "Le titre doit faire 100 caractères maximum.",
      });
    });

    it("should return 400 if description length is >= 1000", async () => {
      const post = await supertest(app)
        .post("/feedbacks")
        .set("authorization", token)
        .send(postAFeedback);

      const updatedFeedback = {
        object: post.body.object,
        title: "Titre mis à jour",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(
            20
          ),
        read: true,
        hightPriority: true,
      };

      const { statusCode, body } = await supertest(app)
        .put(`/feedbacks/single/${post.body.id}`)
        .set("authorization", tokenAdmin)
        .send(updatedFeedback);

      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["description"],
        msg: "La description doit faire 1000 caractères maximum.",
      });
    });
  });
  describe("DELETE /feedbacks/single/:feedback_id", () => {
    it("should return 204 if feedback is deleted successfully", async () => {
      const post = await supertest(app)
        .post("/feedbacks")
        .set("authorization", token)
        .send(postAFeedback);

      const { statusCode } = await supertest(app)
        .delete(`/feedbacks/single/${post.body.id}`)
        .set("authorization", tokenAdmin);

      expect(statusCode).toBe(204);
    });

    it("should return 404 if feedback does not exist", async () => {
      const { statusCode, body } = await supertest(app)
        .delete(`/feedbacks/single/1000`)
        .set("authorization", tokenAdmin);

      expect(statusCode).toBe(404);
      expect(body).toEqual({ msg: "Feedback non trouvé." });
    });
  });
  describe("Object", () => {
    describe("GET ALL /feedbacks/object", () => {
      it("should return 200 and a list of object feedbacks", async () => {
        const { statusCode, body } = await supertest(app)
          .get("/feedbacks/object")
          .set("authorization", token);

        expect(statusCode).toBe(200);
        expect(body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              label: expect.any(String),
              icon: expect.any(String),
            }),
          ])
        );
      });
    });

    describe("POST /feedbacks/object", () => {
      it("should create a new object feedback and return 200", async () => {
        const objectFeedback = {
          label: "Feature Request",
          icon: "feature_icon",
        };

        const { statusCode, body } = await supertest(app)
          .post("/feedbacks/object")
          .set("authorization", tokenAdmin)
          .send(objectFeedback);
        console.error(body);
        expect(statusCode).toBe(200);

        const createdFeedback = await ObjectFeedback.findOne({
          where: { label: "Feature Request" },
        });

        expect(createdFeedback).not.toBeNull();
        expect(createdFeedback?.label).toBe("Feature Request");
        expect(createdFeedback?.icon).toBe("feature_icon");
      });

      it("should return 404 if label is missing", async () => {
        const objectFeedback = {
          icon: "feature_icon",
        };

        const { statusCode, body } = await supertest(app)
          .post("/feedbacks/object")
          .set("authorization", tokenAdmin)
          .send(objectFeedback);

        expect(statusCode).toBe(404);
        expect(body).toEqual({ msg: "Label obligatoire." });
      });

      it("should return 404 if icon is missing", async () => {
        const objectFeedback = {
          label: "Feature Request",
        };

        const { statusCode, body } = await supertest(app)
          .post("/feedbacks/object")
          .set("authorization", tokenAdmin)
          .send(objectFeedback);

        expect(statusCode).toBe(404);
        expect(body).toEqual({ msg: "Icon obligatoire." });
      });
      it("should return 400 if the label already exists", async () => {
        const objectFeedback = {
          label: "Feature Request",
          icon: "feature_icon",
        };
        await supertest(app)
          .post("/feedbacks/object")
          .set("authorization", tokenAdmin)
          .send(objectFeedback);

        const { statusCode, body } = await supertest(app)
          .post("/feedbacks/object")
          .set("authorization", tokenAdmin)
          .send(objectFeedback);

        expect(statusCode).toBe(400);
        expect(body).toEqual({ msg: "L'objet existe déjà." });
      });
    });

    describe("GET /feedbacks/object/:label", () => {
      it("should return an object feedback with status 200", async () => {
        const objectFeedback = {
          label: "Feature Request",
          icon: "feature_icon",
        };
        await supertest(app)
          .post("/feedbacks/object")
          .set("authorization", tokenAdmin)
          .send(objectFeedback);
        const { statusCode, body } = await supertest(app)
          .get(`/feedbacks/object/${objectFeedback.label}`)
          .set("authorization", token);

        expect(statusCode).toBe(200);
        expect(body).toEqual(expect.objectContaining(objectFeedback));
      });

      it("should return 404 if object feedback not found", async () => {
        const { statusCode, body } = await supertest(app)
          .get(`/feedbacks/object/NonExistentLabel`)
          .set("authorization", token);

        expect(statusCode).toBe(404);
        expect(body).toEqual({ msg: "Object Feedback non trouvée." });
      });
    });
    describe("PUT /feedbacks/object", () => {
      const objectFeedback = {
        label: "Feature Request",
        icon: "feature_icon",
      };
      it("should return 200 if update object feedback and return 200", async () => {
        await supertest(app)
          .post("/feedbacks/object")
          .set("authorization", tokenAdmin)
          .send(objectFeedback);
        const { statusCode, body } = await supertest(app)
          .put(`/feedbacks/object/`)
          .set("authorization", tokenAdmin)
          .send({ icon: "lala" });
        console.error(body);
        expect(statusCode).toBe(200);

        const createdFeedback = await ObjectFeedback.findOne({
          where: { label: "lala" },
        });

        expect(createdFeedback).not.toBeNull();
        expect(createdFeedback?.label).toBe("lala");
        expect(createdFeedback?.icon).toBe("lala");
      });

      // it("should return 404 if label is missing", async () => {
      //   await supertest(app)
      //     .post("/feedbacks/object")
      //     .set("authorization", tokenAdmin)
      //     .send(objectFeedback);
      //   const updatedFeedback = {
      //     icon: "feature_icon",
      //   };

      //   const { statusCode, body } = await supertest(app)
      //     .put("/feedbacks/object")
      //     .set("authorization", tokenAdmin)
      //     .send(updatedFeedback);

      //   expect(statusCode).toBe(404);
      //   expect(body).toEqual({ msg: "Label obligatoire." });
      // });

      // it("should return 404 if icon is missing", async () => {
      //   await supertest(app)
      //     .post("/feedbacks/object")
      //     .set("authorization", tokenAdmin)
      //     .send(objectFeedback);
      //   const updatedFeedback = {
      //     label: "Feature Request",
      //   };

      //   const { statusCode, body } = await supertest(app)
      //     .put("/feedbacks/object")
      //     .set("authorization", tokenAdmin)
      //     .send(updatedFeedback);

      //   expect(statusCode).toBe(404);
      //   expect(body).toEqual({ msg: "Icon obligatoire." });
      // });
      // it("should return 400 if object feedback does'nt exist", async () => {
      //   await supertest(app)
      //     .post("/feedbacks/object")
      //     .set("authorization", tokenAdmin)
      //     .send(objectFeedback);
      //   const updatedFeedback = {
      //     label: "Featureee Request",
      //     icon: "feature_icon",
      //   };

      //   const { statusCode, body } = await supertest(app)
      //     .put("/feedbacks/object")
      //     .set("authorization", tokenAdmin)
      //     .send(updatedFeedback);
      //   expect(statusCode).toBe(200);

      //   expect(body).toEqual({ msg: "ObjectFeedback non trouvée." });
      // });
    });
  });
});
