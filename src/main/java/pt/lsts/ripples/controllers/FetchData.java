package pt.lsts.ripples.controllers;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import pt.lsts.ripples.domain.wg.EnvDatum;
import pt.lsts.ripples.repo.EnvDataRepository;
import pt.lsts.ripples.util.DateUtil;
import pt.lsts.ripples.util.netcdf.NetCDFUtils;
import pt.lsts.ripples.util.netcdf.exporter.NetCDFExportWriter;
import pt.lsts.ripples.util.netcdf.exporter.NetCDFRootAttributes;
import pt.lsts.ripples.util.netcdf.exporter.NetCDFVarElement;
import ucar.ma2.DataType;
import ucar.nc2.Dimension;
import ucar.nc2.NetcdfFileWriter;

@RestController()
public class FetchData {

    @SuppressWarnings("serial")
	public static final SimpleDateFormat dateTimeFormatterISO8601NoMillis = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", new Locale("en")) {{setTimeZone(TimeZone.getTimeZone("UTC"));}};

	@Autowired
	EnvDataRepository repo;

	@RequestMapping(value = "/data/{vehicle}.csv", produces = "text/csv")
	public void getCsv(@RequestParam(defaultValue = "-24h") String start,
			@PathVariable String vehicle, HttpServletResponse response)
					throws IOException {
		response.getWriter().write("vehicle,latitude,longitude,timestamp,salinity,temperature,conductivity,pressure\n");
		Date startDate = DateUtil.parse(start);
		List<EnvDatum> data;

		if (vehicle.equals("any"))
			data = repo.findByTimestampAfterOrderByTimestampDesc(startDate);
		else
			data = repo.findBySourceAndTimestampAfterOrderByTimestampDesc(vehicle, startDate);

		for (EnvDatum d : data) {
			response.getWriter().write(String.join(",", d.getSource(), String.valueOf(d.getLatitude()),
					String.valueOf(d.getLongitude()), String.valueOf(d.getTimestamp()),
					String.format("%.3f", d.getValues().get("salinity")), String.format("%.3f", d.getValues().get("temperature")),
					String.format("%.3f", d.getValues().get("conductivity")), String.format("%.3f", d.getValues().get("pressure"))));
			response.getWriter().write('\n');
		}

		response.getWriter().close();
	}
	
	private void writeJson2(ConcurrentHashMap<String, LinkedList<EnvDatum>> locations, HttpServletResponse response) throws IOException {
		response.setStatus(200);
		response.setContentType("application/vnd.geo+json");
		response.getWriter().write(
				"{\"type\": \"FeatureCollection\",\n"+
				"\"features\": [\n");

		boolean firstFeature = true;
		for (String name : locations.keySet()) {
			if (!firstFeature)
				response.getWriter().write(",\n");
			firstFeature = false;
			response.getWriter().write(
					"{\"type\": \"Feature\",\n"+
							"\"properties\": {\"system\": \""+ name + "\"},\n"+
							"\"geometry\": { \"type\": \"LineString\", \"coordinates\": [");
			boolean first = true;
			for (EnvDatum coords : locations.get(name)) {
				if (first)
					response.getWriter().write("[" + coords.getLongitude() + "," + coords.getLatitude() + "]");
				else
					response.getWriter().write(", [" + coords.getLongitude() + "," + coords.getLatitude() + "]");
				first = false;
			}
			response.getWriter().write("]}}");
		}
		response.getWriter().write("]}\n");
		response.getWriter().close();
	}
	
	private void writeJson(ConcurrentHashMap<String, LinkedList<EnvDatum>> locations, HttpServletResponse response) throws IOException {
		response.setStatus(200);
		response.setContentType("application/vnd.geo+json");
		response.getWriter().write(
				"{\"type\": \"FeatureCollection\",\n"+
				"\"features\": [\n");
		SimpleDateFormat sdf = new SimpleDateFormat("MMM dd, HH:mm ZZZ");
		sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
		String json = locations.values().stream().flatMap(ll -> ll.stream()).map(datum -> {
			return "{\"type\": \"Feature\","+
					"\n\"properties\": {\"system\": \""+ datum.getSource() + "\","+
					"\"salinity\": \""+String.format("%.3f", datum.getValues().get("salinity"))+"\","+
					"\"temperature\": \""+String.format("%.3f", +datum.getValues().get("temperature"))+"\","+
					"\"time\": \""+sdf.format(datum.getTimestamp())+"\"},"+
					"\n\"geometry\": { \"type\": \"Point\", \"coordinates\": "+
					"[" + datum.getLongitude() + "," + datum.getLatitude() + "]}}";}).collect(Collectors.joining(",\n"));
		response.getWriter().write(json);
		response.getWriter().write("]}\n");
		response.getWriter().close();
	}	
	
	@RequestMapping(value = "/data/{vehicle}.geojson", produces = "text/csv")
	public void getGeoJson(@RequestParam(defaultValue = "-10d") String start, @PathVariable String vehicle,
			HttpServletResponse response) throws IOException {
		Date startDate = DateUtil.parse(start);
		List<EnvDatum> data;

		if (vehicle.equals("any"))
			data = repo.findByTimestampAfterOrderByTimestampDesc(startDate);
		else
			data = repo.findBySourceAndTimestampAfterOrderByTimestampDesc(vehicle, startDate);
		ConcurrentHashMap<String, LinkedList<EnvDatum>> locations = new ConcurrentHashMap<>();

		for (EnvDatum d : data) {
			locations.putIfAbsent(d.getSource(), new LinkedList<>()); 
			LinkedList<EnvDatum> list = locations.get(d.getSource());
			
			if (list.isEmpty() || list.getFirst().getTimestamp().getTime() - d.getTimestamp().getTime() >= 3600_000) {
				list.addFirst(d);
			}
		}

		writeJson(locations, response);		
	}

	@RequestMapping(value = "/data.json", produces = "application/json")
	public Iterable<EnvDatum> getData(@RequestParam(defaultValue = "-24h") String start,
			@RequestParam(defaultValue = "wg-sv3-127") String vehicle, HttpServletResponse response) {
		Date startDate = DateUtil.parse(start);

		if (startDate == null)
			return repo.findBySource(vehicle);
		else
			return repo.findBySourceAndTimestampAfterOrderByTimestampDesc(vehicle, startDate);
	}

	@RequestMapping(value = "/data/{vehicle}.nc", produces = "application/x-netcdf")
	public void getNetCDF(@RequestParam(defaultValue = "-24h") String start,
			@PathVariable String vehicle, HttpServletResponse response)
					throws IOException {
		
		Date startSearchDate = DateUtil.parse(start);
		List<EnvDatum> data;

		if (vehicle.equals("any"))
			data = repo.findByTimestampAfterOrderByTimestampDesc(startSearchDate);
		else
			data = repo.findBySourceAndTimestampAfterOrderByTimestampDesc(vehicle, startSearchDate);
		
		if (data == null || data.isEmpty())  {
			response.getWriter().close();
			return;
		}
		
		File exportFile = File.createTempFile("wgviewer", ".nc");
		String location = exportFile.getAbsolutePath();
        try (NetcdfFileWriter writer = NetCDFExportWriter.createWriter(exportFile)) {
//        	writer.setFill(true); // to allow fill the empty: Does not seams to work as expected
        	
        	EnvDatum fd = data.stream().findFirst().get();
            NetCDFRootAttributes rootAttr = NetCDFRootAttributes.createDefault(location, location);
            rootAttr.setDateModified(data.get(data.size() - 1).getTimestamp()).setId(fd.getSource());

            data = data.stream().sorted((t1, t2) -> t1.getTimestamp().compareTo(t2.getTimestamp()))
            		.collect(Collectors.toList());

			List<String> sources = data.stream().map(e -> e.getSource()).distinct().collect(Collectors.toList());
            
            int obsNumber = data.size();
            
            rootAttr.write(writer);

            // add dimensions
            Dimension trajDim = writer.addDimension(null, "trajectory", sources.size());
            Dimension obsDim = writer.addDimension(null, "obs", obsNumber);

            List<Dimension> dimsTraj = new ArrayList<Dimension>();
            dimsTraj.add(trajDim);

            List<Dimension> dims = new ArrayList<Dimension>();
            dims.add(trajDim);
            dims.add(obsDim);

            List<NetCDFVarElement> varsList = new ArrayList<>();

            Date startDate = data.stream().findFirst().get().getTimestamp();
            NetCDFVarElement timeVar = new NetCDFVarElement("time").setLongName("time").setStandardName("time")
                    .setUnits("seconds since " + dateTimeFormatterISO8601NoMillis.format(startDate))
                    .setDataType(DataType.DOUBLE).setDimensions(dims).setAtribute("axis", "T");
            varsList.add(timeVar);

            NetCDFVarElement latVar = new NetCDFVarElement("lat").setLongName("latitude").setStandardName("latitude")
                    .setUnits("degrees_north").setDataType(DataType.DOUBLE).setDimensions(dims).setAtribute("axis", "Y")
                    .setAtribute(NetCDFUtils.NETCDF_ATT_FILL_VALUE, "-9999")
                    .setAtribute(NetCDFUtils.NETCDF_ATT_MISSING_VALUE, "-9999").setAtribute("valid_min", "-90")
                    .setAtribute("valid_max", "90");
            varsList.add(latVar);

            NetCDFVarElement lonVar = new NetCDFVarElement("lon").setLongName("longitude").setStandardName("longitude")
                    .setUnits("degrees_east").setDataType(DataType.DOUBLE).setDimensions(dims).setAtribute("axis", "X")
                    .setAtribute(NetCDFUtils.NETCDF_ATT_FILL_VALUE, "-9999")
                    .setAtribute(NetCDFUtils.NETCDF_ATT_MISSING_VALUE, "-9999").setAtribute("valid_min", "-180")
                    .setAtribute("valid_max", "180");
            varsList.add(lonVar);

            // scaled as 0.1
            NetCDFVarElement depthVar = new NetCDFVarElement("depth").setLongName("depth").setStandardName("depth")
                    .setUnits("m").setDataType(DataType.INT).setDimensions(dims).setAtribute("axis", "Z")
                    .setAtribute(NetCDFUtils.NETCDF_ATT_FILL_VALUE, "-9999")
                    .setAtribute(NetCDFUtils.NETCDF_ATT_MISSING_VALUE, "-9999").setAtribute("valid_min", "0")
                    .setAtribute("scale_factor", "0.1").setAtribute("positive", "down")
                    .setAtribute("_CoordinateAxisType", "Depth").setAtribute("_CoordinateZisPositive", "down")
                    .setAtribute("coordinates", "time lat lon");
            varsList.add(depthVar);

            NetCDFVarElement trajVar = new NetCDFVarElement("trajectory").setLongName("trajectory")
                    .setDataType(DataType.INT).setDimensions(dimsTraj);
            varsList.add(trajVar);

            // trajVar.insertData(1, 0);
            for (int i = 0; i < sources.size(); i++) {
            	trajVar.insertData(i + 1, i);
			}

            NetCDFVarElement condVar = new NetCDFVarElement("cond").setLongName("Conductivity")
                        .setStandardName("sea_water_electrical_conductivity").setUnits("S m-1").setDataType(DataType.FLOAT)
                        .setDimensions(dims).setAtribute(NetCDFUtils.NETCDF_ATT_FILL_VALUE, "NaN")
                        .setAtribute(NetCDFUtils.NETCDF_ATT_MISSING_VALUE, "NaN")
                        .setAtribute("coordinates", "time depth lat lon");
            varsList.add(condVar);
            NetCDFVarElement salVar = new NetCDFVarElement("sal").setLongName("Salinity")
            		.setStandardName("sea_water_practical_salinity").setUnits("PSU").setDataType(DataType.FLOAT)
            		.setDimensions(dims).setAtribute(NetCDFUtils.NETCDF_ATT_FILL_VALUE, "NaN")
            		.setAtribute(NetCDFUtils.NETCDF_ATT_MISSING_VALUE, "NaN")
            		.setAtribute("coordinates", "time depth lat lon");
            varsList.add(salVar);
            NetCDFVarElement tempVar = new NetCDFVarElement("temp_cdt").setLongName("Temperature CTD")
                        .setStandardName("sea_water_temperature").setUnits("degree_C").setDataType(DataType.FLOAT)
                        .setDimensions(dims).setAtribute(NetCDFUtils.NETCDF_ATT_FILL_VALUE, "NaN")
                        .setAtribute(NetCDFUtils.NETCDF_ATT_MISSING_VALUE, "NaN")
                        .setAtribute("coordinates", "time depth lat lon");
            varsList.add(tempVar);

            int idx = -1;
    		for (EnvDatum d : data) {
    			idx++;
    			
    			String src = d.getSource();
    			int traj = sources.indexOf(src);
    			for (int i = 0; i < sources.size(); i++) {
    				if (i == traj)
    					continue;

        			timeVar.insertData((d.getTimestamp().getTime() - startDate.getTime()) / 1E3, i, idx);
                    latVar.insertData(-9999, i, idx);
                    lonVar.insertData(-9999, i, idx);
                    depthVar.insertData(-9999, i, idx);
                    
                    condVar.insertData(Float.NaN, i, idx);
                    salVar.insertData(Float.NaN, i, idx);
                    tempVar.insertData(Float.NaN, i, idx);
				}
    			
    			timeVar.insertData((d.getTimestamp().getTime() - startDate.getTime()) / 1E3, traj, idx);
                latVar.insertData(d.getLatitude(), traj, idx);
                lonVar.insertData(d.getLongitude(), traj, idx);
                double depth = Double.NaN;
                try {
                	depth = d.getValues().get("pressure");
				}
                catch (Exception e) {
					// TODO: handle exception
				}
                depthVar.insertData(Double.isFinite(depth) ? depth : -9999, traj, idx);

                double cond = Double.NaN;
                try {
                	cond = d.getValues().get("conductivity");
				}
                catch (Exception e) {
					// TODO: handle exception
				}
                condVar.insertData(Double.isFinite(cond) ? cond: Float.NaN, traj, idx);

                double sal = Double.NaN;
                try {
                	sal = d.getValues().get("salinity");
				}
                catch (Exception e) {
					// TODO: handle exception
				}
                salVar.insertData(Double.isFinite(sal) ? sal : Float.NaN, traj, idx);

                double temp = Double.NaN;
                try {
                	temp = d.getValues().get("temperature");
				}
                catch (Exception e) {
					// TODO: handle exception
				}
                tempVar.insertData(Double.isFinite(temp) ? temp : Float.NaN, traj, idx);
    		}

            // Now writing data
            varsList.stream().forEach(v -> v.writeVariable(writer));
            writer.create();
            varsList.stream().forEach(v -> v.writeData(writer));
        }
        catch (Exception e) {
			e.printStackTrace();
		}

		try (FileInputStream is = new FileInputStream(exportFile);
				ServletOutputStream os = response.getOutputStream();) {
			IOUtils.copy(is, os);
			os.flush();
		}
		catch (Exception e) {
			e.printStackTrace();
		}

		response.getWriter().close();
	}
}
