import ObjectFeedback from "../models/objectFeedbackModel";

export const existFeedback = ({
  object,
  title,
  description,
  admin,
  read,
  hightPriority,
}: {
  object: string;
  title: string;
  description: string;
  admin?: boolean;
  read?: boolean;
  hightPriority?: boolean;
}) => {
  if (!object) throw { param: ["object"], msg: "L'objet est obligatoire." };
  if (!title) throw { param: ["title"], msg: "Le titre est obligatoire." };
  if (!description)
    throw {
      param: ["description"],
      msg: "La description est obligatoire.",
    };
  if (admin) {
    if (!read)
      throw {
        param: ["read"],
        msg: "Savoir si le feedback a été lu est obligatoire.",
      };
    if (!hightPriority)
      throw {
        param: ["hightPriority"],
        msg: "Savoir si le feedback est prioritaire est obligatoire.",
      };
  }
};

export const objectValidationFeedback = async ({
  objectLabel,
}: {
  objectLabel: string;
}) => {
  const object = await ObjectFeedback.findByPk(objectLabel);
  if (!object)
    throw {
      param: ["object"],
      msg: "Vous devez utiliser un objet prédéfini.",
      status: 404,
    };
};

export const feedbackLengthValidation = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  if (title.length >= 100)
    throw {
      param: ["title"],
      msg: "Le titre doit faire 100 caractères maximum.",
    };
  if (description.length >= 1000)
    throw {
      param: ["description"],
      msg: "La description doit faire 1000 caractères maximum.",
    };
};
