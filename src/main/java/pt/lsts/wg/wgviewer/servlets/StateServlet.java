package pt.lsts.wg.wgviewer.servlets;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.HttpServletBean;

@WebServlet(name="StateServlet", urlPatterns= {"/state/*"})
public class StateServlet extends HttpServletBean{

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		
	}
	
}
