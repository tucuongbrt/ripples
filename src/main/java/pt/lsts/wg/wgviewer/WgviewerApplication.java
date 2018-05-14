package pt.lsts.wg.wgviewer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.ServletComponentScan;

@SpringBootApplication
@ServletComponentScan
public class WgviewerApplication {

	public static void main(String[] args) {
		System.setProperty("server.port", "9090");
		SpringApplication.run(WgviewerApplication.class, args);		
	}
}
