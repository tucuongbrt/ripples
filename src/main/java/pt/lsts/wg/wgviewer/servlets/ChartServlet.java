package pt.lsts.wg.wgviewer.servlets;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.knowm.xchart.BitmapEncoder;
import org.knowm.xchart.BitmapEncoder.BitmapFormat;
import org.knowm.xchart.XYChart;
import org.knowm.xchart.XYChartBuilder;
import org.knowm.xchart.XYSeries;
import org.knowm.xchart.style.Styler.ChartTheme;
import org.knowm.xchart.style.markers.SeriesMarkers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.servlet.HttpServletBean;

import pt.lsts.wg.wgviewer.domain.EnvDatum;
import pt.lsts.wg.wgviewer.repo.EnvDataRepository;

@WebServlet(name="ChartServlet", urlPatterns= {"/wg/*"})
public class ChartServlet extends HttpServletBean {
	
	private static final long serialVersionUID = 1L;
	
	@Autowired
	private EnvDataRepository repo;
	
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		
		String strVehicle = "wg-sv3-127";
		String parts[] = req.getRequestURI().split("/");
		
		
		final String var = parts.length > 2 ? parts[2].substring(0, parts[2].indexOf('.')) : "Salinity";
		final String v = var.toLowerCase();
		try {
			Page<EnvDatum> page = repo.findBySourceOrderByTimestampDesc(strVehicle, PageRequest.of(0, 1000));
			
			List<Double> sal = page.stream().map(e -> e.getValues().get(v)).collect(Collectors.toList());
			List<Double> lon = page.stream().map(e -> e.getLongitude()).collect(Collectors.toList());
			
			XYChart chart = new XYChartBuilder().theme(ChartTheme.GGPlot2)
					.width(1920)
					.height(1080)
					.title("WaveGlider "+var).build();
		    chart.setXAxisTitle("Longitude");
		    chart.setXAxisTitle(var);
		    
		    XYSeries series = chart.addSeries(var,lon, sal);
		    series.setMarker(SeriesMarkers.NONE);
			resp.setStatus(200);
			resp.setContentType("image/png");
			BitmapEncoder.saveBitmap(chart, resp.getOutputStream(), BitmapFormat.PNG);
			resp.getOutputStream().close();	
		}
		catch (Exception e) {
			resp.setStatus(400);
			resp.setContentType("text/plain");
			resp.getWriter().write("Bad request format.");
			resp.getWriter().close();
		} 
		
		
	}
}
