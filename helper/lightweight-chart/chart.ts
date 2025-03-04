import {
  ChartOptions,
  AreaSeriesOptions,
  ColorType,
  LineStyle,
  PriceScaleMode,
  CrosshairMode,
  Time,
} from "lightweight-charts";
import { DateTime } from "luxon";

export const buildChartOptions = (
  theme: string
): {
  chartOptions: Partial<ChartOptions>;
  candlestickColors: {
    upColor: string;
    downColor: string;
    borderUpColor: string;
    borderDownColor: string;
    wickUpColor: string;
    wickDownColor: string;
    wickVisible: boolean;
  };
  areaSeriesOptions: Partial<AreaSeriesOptions>;
} => {
  const chartOptions: Partial<ChartOptions> = {
    layout: {
      background: {
        type: ColorType.Solid,
        color: theme === "dark" ? "#1a2029" : "#ffffff",
      },
      textColor: theme === "dark" ? "#ffffff" : "#000000",
      fontSize: 12,
      fontFamily: "Arial, sans-serif",
      attributionLogo: true,
    },
    grid: {
      vertLines: {
        color: theme === "dark" ? "#444444" : "#e1e1e1",
        style: LineStyle.Dotted,
        visible: true,
      },
      horzLines: {
        color: theme === "dark" ? "#444444" : "#e1e1e1",
        style: LineStyle.Dotted,
        visible: true,
      },
    },
    timeScale: {
      rightOffset: 0,
      barSpacing: 16,
      minBarSpacing: 4,
      fixLeftEdge: false,
      fixRightEdge: false,
      rightBarStaysOnScroll: true,
      borderVisible: false,
      timeVisible: true,
      secondsVisible: true,
      lockVisibleTimeRangeOnResize: true,
      borderColor: theme === "dark" ? "#444444" : "red",
      visible: true,
      shiftVisibleRangeOnNewBar: true,
      allowShiftVisibleRangeOnWhitespaceReplacement: false,
      ticksVisible: true,
      uniformDistribution: false,
      minimumHeight: 0,
      allowBoldLabels: true,
      tickMarkFormatter: (time: Time) => {
        const unixTime = Number(time);
        const dateTime = DateTime.fromSeconds(unixTime)
          .setZone("UTC-6")
          .startOf('minute');
        return dateTime.toFormat("HH:mm");
      }
    },
    rightPriceScale: {
      borderVisible: false,
      autoScale: true,
      mode: PriceScaleMode.Normal,
      invertScale: false,
      alignLabels: true,
      scaleMargins: {
        top: 0.02,
        bottom: 0.02,
      },
      borderColor: theme === "dark" ? "#444444" : "red",
      textColor: theme === "dark" ? "#ffffff" : "#000000",
      entireTextOnly: false,
      visible: true,
      ticksVisible: true,
      minimumWidth: 0,
    },
    crosshair: {
      mode: CrosshairMode.Magnet,
      vertLine: {
        color: "#0d699f",
        style: LineStyle.Solid,
        visible: true,
        width: 1,
        labelVisible: true,
        labelBackgroundColor: "#0d699f",
      },
      horzLine: {
        color: "#0d699f",
        style: LineStyle.Solid,
        visible: true,
        width: 1,
        labelVisible: true,
        labelBackgroundColor: "#0d699f",
      },
    },
  };
  
  // Localization settings
  let currentLocale = "en-US"; // Default locale
  if (typeof window !== "undefined") {
    currentLocale = window.navigator.languages[0] || "en-US";
  }

  // Updated priceFormatter that returns a number with comma separation and no currency symbol
  const priceFormatter = (value: number): string => {
    return new Intl.NumberFormat(currentLocale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  chartOptions.localization = {
    locale: currentLocale,
    dateFormat: "yyyy-MM-dd",
    priceFormatter: priceFormatter,
    timeFormatter: (time: Time) => {
      const unixTime = Number(time);
      const dateTime = DateTime.fromSeconds(unixTime)
      .setZone("UTC-6")
      .startOf("minute");
      return dateTime.toFormat("dd LLL yyyy HH:mm");
    },
  };

  const candlestickColors = {
    upColor: "#18a34a",
    downColor: "#dc2525",
    borderUpColor: "#18a34a",
    borderDownColor: "#dc2525",
    wickUpColor: "#18a34a",
    wickDownColor: "#dc2525",
    wickVisible: true,
  };

  const areaSeriesOptions: Partial<AreaSeriesOptions> = {
    lastValueVisible: false,
    crosshairMarkerVisible: false,
    priceLineVisible: false,
    lineColor: "transparent",
  };

  return {
    chartOptions,
    candlestickColors,
    areaSeriesOptions,
  };
};
