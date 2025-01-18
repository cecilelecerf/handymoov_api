import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NOW,
  Sequelize,
} from "sequelize";
import { DataTypes } from "sequelize";
import { decryptData, encryptData } from "../utils/crypto";

const userDB = process.env.DB_USER;
const passwordDB = process.env.DB_PASSWORD;
const hostDB = process.env.DB_HOST;
const nameDB = process.env.DB_NAME;
const db = new Sequelize(nameDB, userDB, passwordDB, {
  host: hostDB,
  dialect: "mysql",
});

class PersonalizedAddress extends Model<
  InferAttributes<PersonalizedAddress>,
  InferCreationAttributes<PersonalizedAddress>
> {
  declare id: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare modifiedAt: CreationOptional<Date>;
  declare label: string;
  declare country?: string;
  declare city?: string;
  declare street?: string;
  declare number?: string;
  declare lat?: string;
  declare lng?: string;
  declare user_id: string;
  declare country_iv?: string;
  declare city_iv?: string;
  declare street_iv?: string;
  declare number_iv?: string;
  declare lat_iv?: string;
  declare lng_iv?: string;

  static async encryptAddressData(address: PersonalizedAddress) {
    if (address.country) {
      const { encryptedData, iv } = encryptData(address.country);
      address.country = encryptedData;
      address.country_iv = iv;
    }
    if (address.city) {
      const { encryptedData, iv } = encryptData(address.city);
      address.city = encryptedData;
      address.city_iv = iv;
    }
    if (address.street) {
      const { encryptedData, iv } = encryptData(address.street);
      address.street = encryptedData;
      address.street_iv = iv;
    }
    if (address.number) {
      const { encryptedData, iv } = encryptData(address.number);
      address.number = encryptedData;
      address.number_iv = iv;
    }
    if (address.lat) {
      const { encryptedData, iv } = encryptData(address.lat.toString());
      address.lat = encryptedData;
      address.lat_iv = iv;
    }
    if (address.lng) {
      const { encryptedData, iv } = encryptData(address.lng.toString());
      address.lng = encryptedData;
      address.lng_iv = iv;
    }
  }

  static async decryptAddressData(address: PersonalizedAddress) {
    if (address.country && address.country_iv) {
      address.country = decryptData(address.country, address.country_iv);
    }
    if (address.city && address.city_iv) {
      address.city = decryptData(address.city, address.city_iv);
    }
    if (address.street && address.street_iv) {
      address.street = decryptData(address.street, address.street_iv);
    }
    if (address.number && address.number_iv) {
      address.number = decryptData(address.number, address.number_iv);
    }
    if (address.lat && address.lat_iv) {
      address.lat = decryptData(address.lat, address.lat_iv);
    }
    if (address.lng && address.lng_iv) {
      address.lng = decryptData(address.lng, address.lng_iv);
    }
  }
}

PersonalizedAddress.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: NOW,
    },
    modifiedAt: {
      type: DataTypes.DATE,
      defaultValue: NOW,
    },
    label: {
      type: DataTypes.CHAR(25),
      allowNull: false,
    },
    country: {
      type: DataTypes.CHAR(50),
      allowNull: true,
    },
    city: {
      type: DataTypes.CHAR(50),
      allowNull: true,
    },
    street: {
      type: DataTypes.CHAR(100),
      allowNull: true,
    },
    number: {
      type: DataTypes.CHAR(10),
      allowNull: true,
    },
    lat: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lng: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.UUID,
    },
    country_iv: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city_iv: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    street_iv: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    number_iv: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lat_iv: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lng_iv: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "personalizedAddress",
    timestamps: true,
    underscored: true,
    sequelize: db,
  }
);

PersonalizedAddress.addHook(
  "beforeSave",
  async (address: PersonalizedAddress) => {
    try {
      await PersonalizedAddress.encryptAddressData(address);
    } catch (error) {
      throw new Error("Erreur lors du chiffrement des données d'adresse");
    }
  }
);

PersonalizedAddress.addHook("afterFind", async (result: any) => {
  if (result) {
    if (Array.isArray(result)) {
      result.forEach(async (address: PersonalizedAddress) => {
        await PersonalizedAddress.decryptAddressData(address);
      });
    } else {
      await PersonalizedAddress.decryptAddressData(result);
    }
  }
});

export default PersonalizedAddress;
