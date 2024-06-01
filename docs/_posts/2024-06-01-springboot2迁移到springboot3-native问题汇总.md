---
layout: post
---

# 2024-06-01-springboot2迁移到springboot3-native问题汇总

- 下载jdk：https://bell-sw.com/pages/downloads/native-image-kit/#nik-23-(jdk-21)
- 配置JAVA_HOME
- 注意不能使用openjdk，没有native-image功能

## 1. maven项目配置

### 1.1 项目结构

不要直接继承`spring-boot-parent`项目，如：

```xml

<parent>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-parent</artifactId>
  <version>3.2.6</version>
  <relativePath/>
</parent>
```

因为native插件会把pom项目也编译，但是pom项目下面没有代码会编译失败，删掉上面的parent，使用下面的`dependencyManagement`

```xml

<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-dependencies</artifactId>
      <version>2023.0.0</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>

    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-dependencies</artifactId>
      <version>3.2.6</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>
```

### 1.2 配置`spring-boot-maven-plugin`插件

```xml

<build>
  <plugins>
    <plugin>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-maven-plugin</artifactId>
      <extensions>true</extensions>
      <executions>
        <execution>
          <id>repackage</id>
          <goals>
            <goal>repackage</goal>
          </goals>
          <configuration>
            <classifier>${docker.jar.name-exec}</classifier>
          </configuration>
        </execution>

        <execution>
          <id>process-aot</id>
          <goals>
            <goal>process-aot</goal>
          </goals>
        </execution>
      </executions>
      <configuration>
        <mainClass>${start-class}</mainClass>
        <image>
          <builder>paketobuildpacks/builder-jammy-tiny:latest</builder>
          <env>
            <BP_NATIVE_IMAGE>true</BP_NATIVE_IMAGE>
          </env>
        </image>
      </configuration>
    </plugin>
  </plugins>
</build>
```

### 1.3 配置`mative-maven-plugin` 插件

- 注意：这个是用profiles去根据条件时候启动native插件。
- 注意：在需要编译成native下面创建个 `Dockerfile` 就会自动启配置native插件，而不是为所有的项目都配置native插件（编辑超级慢）。

```xml

<profiles>
  <profile>
    <id>auto-native</id>
    <activation>
      <file>
        <exists>Dockerfile</exists>
      </file>
    </activation>
    <build>
      <plugins>
        <plugin>
          <groupId>org.graalvm.buildtools</groupId>
          <artifactId>native-maven-plugin</artifactId>
          <version>0.10.2</version>
          <configuration>
            <classesDirectory>${project.build.outputDirectory}</classesDirectory>
            <metadataRepository>
              <enabled>true</enabled>
            </metadataRepository>
            <requiredVersion>22.3</requiredVersion>
          </configuration>
          <executions>
            <execution>
              <id>add-reachability-metadata</id>
              <goals>
                <goal>add-reachability-metadata</goal>
              </goals>
            </execution>
          </executions>
        </plugin>
      </plugins>
    </build>
  </profile>
</profiles>
```

## 2. 依赖处理

### 2.1 删掉所有 dependencies中的spring 的版本，交给spring自己去决定使用那个版本

### 2.2 删掉spring-cloud-starter-bootstrap依赖

- 目前不支持spring-cloud-starter-bootstrap
- 使用环境变量去替代bootstrap中的配置,例如`export SPRING_CONFIG_NAME=hello.yaml`

### 2.3 log配置

- 使用logback
- 不要指定logback版本，也交给spring去决定
- `logback-spring.xml`中不能使用`if condition`

## 3. 配置`META-INFO/native-image/reflect-config.json`

### 3.1 配置logback的class，提示少啥就配置啥，以下是示例：

```json
[
  {
    "name": "org.slf4j.impl.StaticLoggerBinder",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.classic.pattern.DateConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.classic.pattern.MessageConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.classic.pattern.ThrowableProxyConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.classic.pattern.NopThrowableInformationConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.classic.pattern.ContextNameConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.core.pattern.color.BoldYellowCompositeConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.classic.pattern.LoggerConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.core.pattern.ReplacingCompositeConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.core.pattern.color.BoldBlueCompositeConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.core.pattern.color.CyanCompositeConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.core.pattern.color.RedCompositeConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.core.pattern.color.WhiteCompositeConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.classic.pattern.PropertyConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.classic.pattern.ExtendedThrowableProxyConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.classic.pattern.RootCauseFirstThrowableProxyConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.classic.pattern.MethodOfCallerConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.classic.pattern.LevelConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.core.pattern.IdentityCompositeConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.core.pattern.color.BoldWhiteCompositeConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.classic.pattern.MarkerConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.core.pattern.color.BoldCyanCompositeConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.core.pattern.color.BoldMagentaCompositeConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.classic.pattern.RelativeTimeConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.core.pattern.color.MagentaCompositeConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.classic.pattern.ClassOfCallerConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.classic.pattern.LineOfCallerConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.classic.pattern.FileOfCallerConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.core.pattern.color.BoldGreenCompositeConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.classic.pattern.LocalSequenceNumberConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.core.pattern.color.YellowCompositeConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.classic.pattern.ExtendedThrowableProxyConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.classic.pattern.color.HighlightingCompositeConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.core.pattern.color.GrayCompositeConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.classic.pattern.MDCConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.classic.pattern.ClassOfCallerConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.core.pattern.color.BoldRedCompositeConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.core.pattern.color.GreenCompositeConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.core.pattern.color.BlackCompositeConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.classic.pattern.ThreadConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.classic.pattern.LineSeparatorConverter",
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.classic.encoder.PatternLayoutEncoder",
    "allPublicMethods": true,
    "allDeclaredConstructors": true
  },
  {
    "name": "ch.qos.logback.core.ConsoleAppender",
    "allPublicMethods": true,
    "allDeclaredConstructors": true
  },
  {
    "name": "com.sun.org.apache.xerces.internal.jaxp.SAXParserFactoryImpl",
    "allDeclaredConstructors": true
  },
  {
    "name": "com.github.benmanes.caffeine.cache.SSA",
    "allDeclaredConstructors": true
  },
  {
    "name": "com.github.benmanes.caffeine.cache.SSW",
    "allDeclaredConstructors": true
  }
]
```

### 3.2 配置caffeine的class，提示少啥就配置啥，以下是示例：

```json

{
  "name": "com.github.benmanes.caffeine.cache.SSA",
  "allDeclaredConstructors": true
}
```

### 3.3 配置jackson需要序列化或反序列化的class，，提示少啥就配置啥，以下是示例：

```json
  {
  "name": "my.models.XXX",
  "allDeclaredConstructors": true,
  "allPublicConstructors": true,
  "allDeclaredMethods": true,
  "allPublicMethods": true,
  "allDeclaredFields": true,
  "allPublicFields": true
}
```
 - 或：https://stackoverflow.com/questions/74908739/spring-boot-3-native-image-with-jackson

## 4.0 启动

### 4.1 编译
```shell
mvn "-Dmaven.test.skip=true" package native:compile
```
### 4.2 启动
```shell
#cd target

#配置spring的启动参数（按需）
export spring_profiles_active=test
export SPRING_CONFIG_NAME=application
export SPRING_CONFIG_LOCATION=.\classes\

# 运行
.\文件名
```
