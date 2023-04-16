---
layout: post
title:  多个spring data源(jdbc/jpa/redis/mongodb)共同使用时冲突问题
---
当项目里面同时使用了多个spring data源的时候spring会不知道加载那个。

### spring log 信息
```log
2022-04-03 13:28:48.978 INFO  [main] RepositoryConfigurationDelegate - Multiple Spring Data modules found, entering strict repository configuration mode!
2022-04-03 13:28:48.980 INFO  [main] RepositoryConfigurationDelegate - Bootstrapping Spring Data JDBC repositories in DEFAULT mode.
2022-04-03 13:28:49.010 INFO  [main] RepositoryConfigurationExtensionSupport - Spring Data JDBC - Could not safely identify store assignment for repository candidate interface ... If you want this repository to be a JDBC repository, consider annotating your entities with one of these annotations: org.springframework.data.relational.core.mapping.Table.

```

### 方法一给model加上对应的注解(从根源解决)
https://docs.spring.io/spring-data/jdbc/docs/current/reference/html/#repositories.multiple-modules

- spring-data-jdbc的注解`Table`
- spring-data-mongodb的注解`Document`
- spring-data-jpa的注解`Entity`

---
### 方法二指定扫描的包，配置文件里禁用不需要的repos
https://stackoverflow.com/questions/39432764/info-warnings-about-multiple-modules-in-spring-boot-what-do-they-mean

这个方法实际测试不生效。

```
@EnableJpaRepositories(basePackages = "com.acme.repositories.jpa")
```
```
@EnableMongoRepositories(basePackages = "com.acme.repositories.mongo")
```
```
spring:
  data:
    redis:
      repositories:
        enabled: false
        type: none
```

---
### 方法三在`EnableJdbcRepositories`加上`includeFilters `绕开限制
```
@EnableJdbcRepositories(basePackages = "com.acme.repositories.jdbc"，
    includeFilters = {@ComponentScan.Filter(type = FilterType.REGEX, pattern = ".*")}
)
```

##### 原理：
1. spring在`RepositoryConfigurationDelegate`里判断时候有多个spring-data源的
```java
	public List<BeanComponentDefinition> registerRepositoriesIn(BeanDefinitionRegistry registry,
			RepositoryConfigurationExtension extension) {
//...(无关代码略)
		Collection<RepositoryConfiguration<RepositoryConfigurationSource>> configurations = extension
				.getRepositoryConfigurations(configurationSource, resourceLoader, inMultiStoreMode);
//...(无关代码略)
    }
```
2. 然后在`RepositoryConfigurationExtensionSupport`进行判断时候加载
```java
	public <T extends RepositoryConfigurationSource> Collection<RepositoryConfiguration<T>> getRepositoryConfigurations(
			T configSource, ResourceLoader loader, boolean strictMatchesOnly) {

		Assert.notNull(configSource, "ConfigSource must not be null!");
		Assert.notNull(loader, "Loader must not be null!");

		Set<RepositoryConfiguration<T>> result = new HashSet<>();

		for (BeanDefinition candidate : configSource.getCandidates(loader)) {

			RepositoryConfiguration<T> configuration = getRepositoryConfiguration(candidate, configSource);
			Class<?> repositoryInterface = loadRepositoryInterface(configuration,
					getConfigurationInspectionClassLoader(loader));

			if (repositoryInterface == null) {
				result.add(configuration);
				continue;
			}

			RepositoryMetadata metadata = AbstractRepositoryMetadata.getMetadata(repositoryInterface);

			boolean qualifiedForImplementation = !strictMatchesOnly || configSource.usesExplicitFilters()
					|| isStrictRepositoryCandidate(metadata);

			if (qualifiedForImplementation && useRepositoryConfiguration(metadata)) {
				result.add(configuration);
			}
		}

		return result;
	}

```
核心的判断是这个
```java
boolean qualifiedForImplementation = !strictMatchesOnly || configSource.usesExplicitFilters() || isStrictRepositoryCandidate(metadata);

```
- `strictMatchesOnly `: 如果有多个spring-data资源这个就为true
- `configSource.usesExplicitFilters()` 这个就是判断`Enable..`注解`includeFilters`,`includeFilters`时候有设置

所以加上这个就能绕开限制了
```java
includeFilters = {@ComponentScan.Filter(type = FilterType.REGEX, pattern = ".*")}
```
