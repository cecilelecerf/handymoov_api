import { Request, Response } from "express";
import { getJourney } from "../utils/primApi";
import Issue from "../models/issueModel";

class JourneyController {
  // Méthode utilitaire pour calculer la distance entre deux points géographiques en mètres
  private static getDistanceFromLatLonInMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Rayon de la Terre en mètres
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  // Méthode pour récupérer et filtrer les trajets
  static async getFilteredJourneys(req: Request, res: Response) {
    try {
      if (!req.body.from || !req.body.to) {
        return res
          .status(400)
          .json({ error: "Les champs 'from' et 'to' sont obligatoires." });
      }

      const dataJourney = await getJourney({
        from: req.body.from,
        to: req.body.to,
      });

      const currentIssue = await Issue.findAll({ where: { actif: true } });
      let filterJourney: any[] = [];

      dataJourney.journeys.forEach((journey: { sections: any[] }) => {
        let hasIssue = false;

        journey.sections.forEach(
          (section: { geojson: { coordinates: any[] } }) => {
            if (section.geojson && section.geojson.coordinates) {
              section.geojson.coordinates.forEach((journeyCoord: number[]) => {
                currentIssue.some((issue) => {
                  const distance =
                    JourneyController.getDistanceFromLatLonInMeters(
                      journeyCoord[1],
                      journeyCoord[0],
                      issue.gpsCoordinateLat,
                      issue.gpsCoordinateLng
                    );

                  if (distance < 20) {
                    hasIssue = true;
                    return true;
                  }
                });

                if (hasIssue) return;
              });
            }

            if (hasIssue) return;
          }
        );

        if (!hasIssue) {
          filterJourney.push(journey);
        }
      });

      res.status(200).json(filterJourney);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch journeys" });
    }
  }
}

export default JourneyController;
