package pt.lsts.ripples.controllers;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map.Entry;

import org.knowm.xchart.BitmapEncoder;
import org.knowm.xchart.BitmapEncoder.BitmapFormat;
import org.knowm.xchart.XYChart;
import org.knowm.xchart.XYChartBuilder;
import org.knowm.xchart.XYSeries;
import org.knowm.xchart.style.Styler.ChartTheme;
import org.knowm.xchart.style.markers.SeriesMarkers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.util.Pair;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import pt.lsts.ripples.domain.wg.EnvDatum;
import pt.lsts.ripples.repo.EnvDataRepository;
import pt.lsts.ripples.util.DateUtil;

@RestController
public class RealTimeChart {

	@Autowired
	EnvDataRepository repo;

	@RequestMapping(value = "/plot/{vehicle}/{var}.png", produces = "image/png")
	public @ResponseBody byte[] getPlot(@PathVariable String vehicle, @PathVariable String var,
			@RequestParam(defaultValue = "-24h") String start) throws IOException {
		List<EnvDatum> data;

		if (vehicle.equals("any"))
			data = repo.findByTimestampAfterOrderByTimestampDesc(DateUtil.parse(start));
		else
			data = repo.findBySourceAndTimestampAfterOrderByTimestampDesc(vehicle, DateUtil.parse(start));

		LinkedHashMap<String, Pair<ArrayList<Double>, ArrayList<Double>>> series = new LinkedHashMap<>();

		double now = System.currentTimeMillis();
		data.forEach(d -> {
			String source = d.getSource();
			if (!series.containsKey(source))
				series.put(source, Pair.of(new ArrayList<>(), new ArrayList<>()));
			series.get(source).getFirst().add((d.getTimestamp().getTime() - now) / 3600_000);
			series.get(source).getSecond().add(d.getValues().get(var));
		});

		XYChart chart = new XYChartBuilder().theme(ChartTheme.GGPlot2).width(1920).height(1080)
				.title(vehicle + " " + var).build();
		chart.setXAxisTitle("Time (relative hours)");
		chart.setYAxisTitle(var);

		for (Entry<String, Pair<ArrayList<Double>, ArrayList<Double>>> e : series.entrySet()) {
			XYSeries xySeries = chart.addSeries(e.getKey(), e.getValue().getFirst(), e.getValue().getSecond());
			xySeries.setMarker(SeriesMarkers.NONE);
		}

		ByteArrayOutputStream out = new ByteArrayOutputStream();
		BitmapEncoder.saveBitmap(chart, out, BitmapFormat.PNG);
		return out.toByteArray();
	}

	@RequestMapping(value = "/plotLon/{vehicle}/{var}.png", produces = "image/png")
	public @ResponseBody byte[] getLonPlot(@PathVariable String var, @PathVariable String vehicle,
			@RequestParam(defaultValue = "-24h") String start) throws IOException {
		List<EnvDatum> data;
		data = repo.findBySourceAndTimestampAfterOrderByTimestampDesc(vehicle, DateUtil.parse(start));

		LinkedHashMap<String, Pair<ArrayList<Double>, ArrayList<Double>>> series = new LinkedHashMap<>();

		data.forEach(d -> {
			String source = d.getSource();
			if (!series.containsKey(source))
				series.put(source, Pair.of(new ArrayList<>(), new ArrayList<>()));
			series.get(source).getFirst().add(d.getLongitude());
			series.get(source).getSecond().add(d.getValues().get(var));
		});

		XYChart chart = new XYChartBuilder().theme(ChartTheme.GGPlot2).width(1920).height(1080)
				.title(vehicle + " " + var).build();
		chart.setXAxisTitle("longitude");
		chart.setYAxisTitle(var);

		for (Entry<String, Pair<ArrayList<Double>, ArrayList<Double>>> e : series.entrySet()) {
			XYSeries xySeries = chart.addSeries(e.getKey(), e.getValue().getFirst(), e.getValue().getSecond());
			xySeries.setMarker(SeriesMarkers.NONE);
		}

		ByteArrayOutputStream out = new ByteArrayOutputStream();
		BitmapEncoder.saveBitmap(chart, out, BitmapFormat.PNG);
		return out.toByteArray();
	}
	
	@RequestMapping(value = "/plotLat/{vehicle}/{var}.png", produces = "image/png")
	public @ResponseBody byte[] getLatPlot(@PathVariable String var, @PathVariable String vehicle,
			@RequestParam(defaultValue = "-24h") String start) throws IOException {
		List<EnvDatum> data;
		data = repo.findBySourceAndTimestampAfterOrderByTimestampDesc(vehicle, DateUtil.parse(start));

		LinkedHashMap<String, Pair<ArrayList<Double>, ArrayList<Double>>> series = new LinkedHashMap<>();

		data.forEach(d -> {
			String source = d.getSource();
			if (!series.containsKey(source))
				series.put(source, Pair.of(new ArrayList<>(), new ArrayList<>()));
			series.get(source).getFirst().add(d.getLatitude());
			series.get(source).getSecond().add(d.getValues().get(var));
		});

		XYChart chart = new XYChartBuilder().theme(ChartTheme.GGPlot2).width(1920).height(1080)
				.title(vehicle + " " + var).build();
		chart.setXAxisTitle("latitude");
		chart.setYAxisTitle(var);

		for (Entry<String, Pair<ArrayList<Double>, ArrayList<Double>>> e : series.entrySet()) {
			XYSeries xySeries = chart.addSeries(e.getKey(), e.getValue().getFirst(), e.getValue().getSecond());
			xySeries.setMarker(SeriesMarkers.NONE);
		}

		ByteArrayOutputStream out = new ByteArrayOutputStream();
		BitmapEncoder.saveBitmap(chart, out, BitmapFormat.PNG);
		return out.toByteArray();
	}

}
