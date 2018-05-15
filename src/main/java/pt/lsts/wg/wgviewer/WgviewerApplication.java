package pt.lsts.wg.wgviewer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.ServletComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@ServletComponentScan
@EnableScheduling
public class WgviewerApplication {

	public static void main(String[] args) {
		SpringApplication.run(WgviewerApplication.class, args);		
	}
}
