export interface BirthChartPlanet {
  position: number;
  sign: string;
  house: number;
}

export interface BirthChartData {
  sun: BirthChartPlanet;
  moon: BirthChartPlanet;
  ascendant: BirthChartPlanet;
  houses: number[];
  calculated_at: string;
}

export interface BirthChartRequest {
  birth_date: string;
  birth_time: string;
  location: string;
}

export interface BirthChartResponse {
  birth_chart: BirthChartData;
}
