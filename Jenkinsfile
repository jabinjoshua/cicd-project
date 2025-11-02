pipeline {
    agent any

    environment {
        // --- !!! REPLACE THESE LATER !!! ---
        AWS_ACCOUNT_ID = "680028182286" 
        AWS_REGION     = "ap-south-1"     // e.g., us-east-1
        ECR_REPO_NAME  = "my-simple-app"       // The ECR repo you will create
        DEPLOY_CREDS   = "deploy-server-ssh-key" // Jenkins credential ID you will create
        DEPLOY_HOST    = "ec2-13-235-73-74.ap-south-1.compute.amazonaws.com" // Public DNS of your deployment server
        DEPLOY_USER    = "ec2-user"            // Default for Amazon Linux 2
        // --- You also need to replace the GitHub URL in stage 1 ---
    }
    tools {
        // This name MUST match the name you gave it in Global Tool Configuration
        nodejs 'NodeJS-16' 
    }

    stages {
        stage('1. Checkout Code') {
            steps {
                echo 'Checking out code from GitHub...'
                // --- !!! REPLACE THIS URL !!! ---
                git branch: 'main', url: 'https://github.com/jabinjoshua/cicd-project.git'
            }
        }

        stage('2. Build & Test') {
            steps {
                echo 'Installing dependencies...'
                sh 'npm install'
                echo 'Running tests...'
                sh 'npm test'
            }
        }

        stage('3. Build Docker Image') {
            steps {
                echo 'Building the Docker image...'
                script {
                    // $BUILD_NUMBER is a built-in Jenkins variable
                    dockerImage = docker.build("${ECR_REPO_NAME}:${BUILD_NUMBER}")
                }
            }
        }

        stage('4. Push Image to AWS ECR') {
            steps {
                echo 'Pushing image to ECR...'
                script {
                    def ecrRepoUrl = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
                    def buildTag = "${ecrRepoUrl}/${ECR_REPO_NAME}:${BUILD_NUMBER}"
                    def latestTag = "${ecrRepoUrl}/${ECR_REPO_NAME}:latest"
                    
                    // 1. Log in (this part was already working)
                    sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ecrRepoUrl}"
                    
                    // 2. Manually tag the image we built in Stage 3
                    //    ${dockerImage.id} is the unique ID of the "my-simple-app:5" image
                    sh "docker tag ${dockerImage.id} ${buildTag}"
                    sh "docker tag ${dockerImage.id} ${latestTag}"

                    // 3. Push both tags to ECR
                    sh "docker push ${buildTag}"
                    sh "docker push ${latestTag}"
                }
            }
        }

        stage('5. Deploy to EC2') {
            steps {
                echo 'Deploying new container to EC2...'
                
                // Use a script block to define a Groovy variable
                script {
                    // 1. Define the full image tag in Groovy
                    def buildTag = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}:${BUILD_NUMBER}"
                    
                    // 2. Now use this variable inside the sshagent
                    sshagent(credentials: [DEPLOY_CREDS]) {
                        sh """
                            ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} '
                                
                                # Log in to ECR on the deployment server
                                # We can pass the region and account ID
                                aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

                                # Stop and remove the old container
                                docker stop simple-web-app || true
                                docker rm simple-web-app || true

                                # Pull the new image using the full tag
                                # The 'buildTag' variable will be expanded by Groovy BEFORE ssh is called
                                docker pull ${buildTag}

                                # Run the new container
                                docker run -d --name simple-web-app -p 3000:3000 ${buildTag}
                            '
                        """
                    }
                }
            }
        }
    }
    
    post {
        // Send email notifications
        success {
            echo 'Pipeline succeeded!'
            // Add your mail step here if you want
        }
        failure {
            echo 'Pipeline failed.'
            // Add your mail step here
        }
    }
}