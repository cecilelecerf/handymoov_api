import multer from "multer";

// Configuration de stockage
const storage = multer.diskStorage({
  destination: function (
    req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) {
    cb(null, "uploads/"); // Dossier où les fichiers seront enregistrés
  },
  filename: function (
    req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) {
    cb(null, `${Date.now()}-${file.originalname}`); // Nom du fichier sauvegardé
  },
});

const fileFilter = function (
  req: Express.Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void
) {
  console.log(file);
  if (file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
    cb(null, true); // Accepter le fichier
  } else {
    cb(new Error("Seules les images PNG et JPEG sont autorisées."), false); // Rejeter le fichier
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

export default upload;
