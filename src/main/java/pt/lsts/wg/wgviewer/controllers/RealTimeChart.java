package pt.lsts.wg.wgviewer.controllers;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.knowm.xchart.BitmapEncoder;
import org.knowm.xchart.BitmapEncoder.BitmapFormat;
import org.knowm.xchart.XYChart;
import org.knowm.xchart.XYChartBuilder;
import org.knowm.xchart.XYSeries;
import org.knowm.xchart.style.Styler.ChartTheme;
import org.knowm.xchart.style.markers.SeriesMarkers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import pt.lsts.wg.wgviewer.domain.EnvDatum;
import pt.lsts.wg.wgviewer.repo.EnvDataRepository;
import pt.lsts.wg.wgviewer.util.DateUtil;

@RestController
public class RealTimeChart {

	@Autowired
	EnvDataRepository repo;

	@RequestMapping(value = "/plot/{vehicle}/{var}.png", produces = "image/png")
	public @ResponseBody byte[] getPlot(@PathVariable String vehicle, @PathVariable String var,
			@RequestParam(defaultValue = "-24h") String since) throws IOException {
		List<EnvDatum> data = repo.findBySourceAndTimestampAfter(vehicle, DateUtil.parse(since));
		ArrayList<Double> time = new ArrayList<>();
		ArrayList<Double> val = new ArrayList<>();
		double now = System.currentTimeMillis();
		data.forEach(d -> {
			time.add((d.getTimestamp().getTime() - now) / 3600_000);
			val.add(d.getValues().get(var));
		});

		XYChart chart = new XYChartBuilder().theme(ChartTheme.GGPlot2).width(1920).height(1080)
				.title(vehicle+" "+ var).build();
		chart.setXAxisTitle("Time (relative hours)");
		chart.setYAxisTitle(var);

		XYSeries series = chart.addSeries(var, time, val);
		series.setMarker(SeriesMarkers.NONE);
		ByteArrayOutputStream out = new ByteArrayOutputStream();
		BitmapEncoder.saveBitmap(chart, out, BitmapFormat.PNG);
		return out.toByteArray();
	}

}
