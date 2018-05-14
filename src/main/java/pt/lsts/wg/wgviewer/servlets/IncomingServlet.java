package pt.lsts.wg.wgviewer.servlets;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.assertj.core.util.Arrays;
import org.springframework.web.servlet.HttpServletBean;

import com.google.gson.Gson;

import pt.lsts.wg.wgviewer.domain.WGCtd;

@WebServlet(name="IncomingServlet", urlPatterns= {"/post/*"})
public class IncomingServlet extends HttpServletBean {

	private Gson gson = new Gson();
	
	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		String parts[] = req.getRequestURI().split("/");
		WGCtd[] data = gson.fromJson(req.getReader(), WGCtd[].class);
		System.out.println(Arrays.asList(parts));
		System.out.println(data.length);
		resp.setStatus(200);
		resp.getOutputStream().close();
	}
}
