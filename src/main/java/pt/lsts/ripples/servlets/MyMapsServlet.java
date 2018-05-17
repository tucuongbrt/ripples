package pt.lsts.ripples.servlets;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.net.URLConnection;
import java.util.zip.ZipInputStream;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;

@WebServlet(name="KmlServlet", urlPatterns= {"/kml/file.kmz"})
public class MyMapsServlet extends HttpServlet {

	@Value("${kmz.url}")
	private String url;
	
	private static final long serialVersionUID = 1L;

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
	    resp.setStatus(200);
	    resp.setContentType("text/plain");
	    
	    URL mapsUrl = new URL(url);
	    URLConnection conn = mapsUrl.openConnection();
	    conn.setUseCaches(false);
	    ZipInputStream zis = new ZipInputStream(conn.getInputStream());
	    zis.getNextEntry();
	    
	    InputStream in = zis;
	    
	    OutputStream out = resp.getOutputStream();
	    
	    byte[] buffer = new byte[1024 * 1024];
	    int len = in.read(buffer);
	    while (len != -1) {
	        out.write(buffer, 0, len);
	        len = in.read(buffer);
	    }
	    zis.close();
	    out.close();
	}
}
