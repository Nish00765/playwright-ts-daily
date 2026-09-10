pipeline {
  agent any

  tools {
    // Must match the name of a NodeJS installation configured in Jenkins
    // (Manage Jenkins → Tools → NodeJS → e.g. "node-20").
    nodejs 'node-20'
  }

  environment {
    CI = 'true'
  }

  options {
    timestamps()
    ansiColor('xterm')
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Install') {
      steps {
        sh 'node --version'
        sh 'npm ci'
      }
    }

    stage('Typecheck') {
      steps { sh 'npm run typecheck' }
    }

    stage('Install Playwright browsers') {
      steps { sh 'npx playwright install --with-deps chromium' }
    }

    stage('Test') {
      steps { sh 'npm test' }
    }

    stage('Deploy to Render') {
      when { branch 'main' }
      steps {
        withCredentials([string(credentialsId: 'render-deploy-hook-url', variable: 'HOOK')]) {
          sh 'curl -fsS -X POST "$HOOK"'
        }
      }
    }
  }

  post {
    always {
      // Always regenerate dashboard (pass or fail)
      sh 'npm run track || true'

      // Publish reports
      junit testResults: 'test-results/junit.xml', allowEmptyResults: true
      archiveArtifacts artifacts: 'playwright-report/**, test-results/**', allowEmptyArchive: true
      publishHTML(target: [
        allowMissing: true,
        alwaysLinkToLastBuild: true,
        keepAll: true,
        reportDir: 'playwright-report',
        reportFiles: 'index.html',
        reportName: 'Playwright HTML Report'
      ])
    }
    failure {
      echo 'Pipeline failed — inspect the Playwright HTML report above.'
    }
  }
}