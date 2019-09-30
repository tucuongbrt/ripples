package pt.lsts.ripples.config;

import javax.persistence.EntityManagerFactory;
import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import java.util.HashMap;

@Configuration
public class DataSourceConfig {

    @Configuration
    @EnableJpaRepositories(entityManagerFactoryRef = "mainEntityManagerFactory", transactionManagerRef = "mainTransactionManager", basePackages = "pt.lsts.ripples.repo.main")
    @EnableTransactionManagement
    public class MainDbConfig {

        @Autowired
        private Environment env;

        @Primary
        @Bean(name = "mainDb")
        @ConfigurationProperties(prefix = "database.main-db.datasource")
        public DataSource mainDataSource() {
            return DataSourceBuilder.create().build();
        }

        @Primary
        @Bean(name = "mainEntityManagerFactory")
        public LocalContainerEntityManagerFactoryBean mainEntityManagerFactory(
                final EntityManagerFactoryBuilder builder, final @Qualifier("mainDb") DataSource dataSource) {
            final HashMap<String, Object> properties = new HashMap<String, Object>();
            properties.put("hibernate.hbm2ddl.auto", env.getProperty("spring.jpa.hibernate.ddl-auto"));
            properties.put("hibernate.dialect", env.getProperty("spring.jpa.persistent.database-platform"));
            final String[] pckgs = { "pt.lsts.ripples.domain.assets", "pt.lsts.ripples.domain.iridium",
                    "pt.lsts.ripples.domain.logbook", "pt.lsts.ripples.domain.maps", "pt.lsts.ripples.domain.security",
                    "pt.lsts.ripples.domain.sms", "pt.lsts.ripples.domain.soi", "pt.lsts.ripples.domain.wg" };
            return builder.dataSource(dataSource).packages(pckgs).persistenceUnit("mainDb").properties(properties)
                    .build();
        }

        @Primary
        @Bean(name = "mainTransactionManager")
        public PlatformTransactionManager mainTransactionManager(
                @Qualifier("mainEntityManagerFactory") EntityManagerFactory mainEntityManagerFactory) {
            return new JpaTransactionManager(mainEntityManagerFactory);
        }
    }

    @Configuration
    @EnableJpaRepositories(entityManagerFactoryRef = "backupEntityManagerFactory", transactionManagerRef = "backupTransactionManager", basePackages = "pt.lsts.ripples.repo.backup")
    @EnableTransactionManagement
    public class BackupDbConfig {

        @Autowired
        private Environment env;

        @Bean(name = "backupDb")
        @ConfigurationProperties(prefix = "database.backup-db.datasource")
        public DataSource backupDataSource() {
            return DataSourceBuilder.create().build();
        }

        @Bean(name = "backupEntityManagerFactory")
        public LocalContainerEntityManagerFactoryBean backupEntityManagerFactory(
                final EntityManagerFactoryBuilder builder, final @Qualifier("backupDb") DataSource dataSource) {
            final HashMap<String, Object> properties = new HashMap<String, Object>();
            properties.put("hibernate.hbm2ddl.auto", env.getProperty("spring.jpa.hibernate.ddl-auto"));
            properties.put("hibernate.dialect", env.getProperty("database.backup-db.datasource.database-platform"));
            final String[] pckgs = { "pt.lsts.ripples.domain.backup" };
            return builder.dataSource(dataSource).packages(pckgs).persistenceUnit("backupDb").properties(properties)
                    .build();
        }

        @Bean(name = "backupTransactionManager")
        public PlatformTransactionManager backupTransactionManager(
                @Qualifier("backupEntityManagerFactory") EntityManagerFactory backupEntityManagerFactory) {
            return new JpaTransactionManager(backupEntityManagerFactory);
        }
    }
}