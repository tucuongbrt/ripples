package pt.lsts.ripples;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.ServletComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import pt.lsts.ripples.config.AppProperties;

@SpringBootApplication
@ServletComponentScan
@EnableScheduling
@EnableConfigurationProperties(AppProperties.class)
@OpenAPIDefinition(info = @Info(title = "Ripples", version="1.0", description = "Application endpoints"))
public class RipplesMain {

	public static void main(String[] args) {
		SpringApplication.run(RipplesMain.class, args);		
	}
}
