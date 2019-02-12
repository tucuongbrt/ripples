package pt.lsts.ripples.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebMvc
public class CorsConfig implements WebMvcConfigurer {
 
	@Value("${in.production}")
	Boolean inProduction;
	
	
    @Override
    public void addCorsMappings(CorsRegistry registry) {
    	if (!inProduction) {
    		registry.addMapping("/**");
    	}
        
    }
}

