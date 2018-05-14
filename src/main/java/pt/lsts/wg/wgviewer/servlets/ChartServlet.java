package pt.lsts.wg.wgviewer.servlets;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.servlet.HttpServletBean;

import pt.lsts.wg.wgviewer.repo.EnvDataRepository;

@WebServlet(name="ChartServlet", urlPatterns= {"/chart/*"})
public class ChartServlet extends HttpServletBean {
	
	private static final long serialVersionUID = 1L;
	
	@Autowired
	private EnvDataRepository repo;
	
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		resp.setStatus(200);
		resp.setContentType("application/json");
		resp.getOutputStream().write("[]".getBytes());
		resp.getOutputStream().close();		
	}
}
