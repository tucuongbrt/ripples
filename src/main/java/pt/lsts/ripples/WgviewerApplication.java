package pt.lsts.ripples;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.ServletComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;
import pt.lsts.ripples.config.AppProperties;

@SpringBootApplication
@ServletComponentScan
@EnableScheduling
@EnableConfigurationProperties(AppProperties.class)
public class WgviewerApplication {

	public static void main(String[] args) {
		SpringApplication.run(WgviewerApplication.class, args);		
	}
}
