package pt.lsts.ripples.servlets;

import java.io.IOException;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.servlet.HttpServletBean;

import com.google.gson.Gson;

import pt.lsts.ripples.domain.wg.EnvDatum;
import pt.lsts.ripples.repo.EnvDataRepository;

@WebServlet(name="StateServlet", urlPatterns= {"/state/*"})
public class StateServlet extends HttpServletBean{


	private static final long serialVersionUID = 1988394141176352701L;

	@Autowired
	EnvDataRepository repo;
	
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		try {
			String parts[] = req.getRequestURI().split("/");
			System.out.println(parts[2]);
			List<EnvDatum> data = repo.findTopBySourceOrderByTimestampDesc(parts[2]);
			resp.setStatus(200);
			resp.setContentType("application/json");
			if (data.isEmpty())
				resp.getWriter().write("{}");			
			else
				resp.getWriter().write(new Gson().toJson(data.get(0)));
			resp.getWriter().close();
		}
		catch (Exception e) {
			e.printStackTrace();
			resp.setStatus(400);
			resp.getWriter().write("Invalid request.");
			resp.getWriter().close();
		}
		
		
	}
	
}
