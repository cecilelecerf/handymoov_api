import { Request, Response } from "express";
import { getJourney } from "../utils/primApi";
import Issue from "../models/issueModel";

export const getFilteredJourneys = async (req: Request, res: Response) => {
  try {
    const dataJourney = await getJourney({
      from: { lat: req.body.fromLat, lng: req.body.fromLng },
      to: { lat: req.body.toLat, lng: req.body.toLng },
    });
    const currentIssue = await Issue.findAll({ where: { actif: true } });
    let filterJourney = [];

    dataJourney.journeys.forEach((journey: { sections: any[] }) => {
      let hasIssue = false;

      journey.sections.forEach(
        (section: { geojson: { coordinates: any[] } }) => {
          if (section.geojson && section.geojson.coordinates) {
            section.geojson.coordinates.forEach((journeyCoord: number[]) => {
              currentIssue.some((issue) => {
                if (
                  Math.abs(journeyCoord[1] - issue.gpsCoordinateLat) < 0.0001 &&
                  Math.abs(journeyCoord[0] - issue.gpsCoordinateLng) < 0.0001
                ) {
                  hasIssue = true;
                }
              });
            });
          }
        }
      );
      if (hasIssue === false) {
        filterJourney.push(journey);
      }
    });

    res.status(200).json(filterJourney);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch journeys" });
  }
};

module.exports = { getFilteredJourneys };
