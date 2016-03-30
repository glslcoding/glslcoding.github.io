#include <GL/glew.h>
#include <GLFW/glfw3.h>
#include <iostream>

using namespace std;
#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
using std::string;
using std::ifstream;

GLuint vboHandles[2];
GLuint vaoHandle;

GLFWwindow *window;

string parseCLArgs(int argc, char ** argv);
void printHelpInfo(const char *);

static void key_callback(GLFWwindow* window, int key, int scancode, int action, int mods)
{
	if (key == GLFW_KEY_SPACE && action == GLFW_RELEASE) {}
}

void mainLoop() {
	while (!glfwWindowShouldClose(window) && !glfwGetKey(window, GLFW_KEY_ESCAPE)) {
		//GLUtils::checkForOpenGLError(__FILE__, __LINE__);

		glClear(GL_COLOR_BUFFER_BIT);
		glBindVertexArray(vaoHandle);
		glDrawArrays(GL_TRIANGLES, 0, 3);

		glfwSwapBuffers(window);
		glfwPollEvents();
	}
}
int main()
{
	// 1. glfw init window
	// Initialize GLFW
	if (!glfwInit()) exit(EXIT_FAILURE);

	window = glfwCreateWindow(800, 600, "My first OpenGL Application", NULL, NULL);

	// Select OpenGL 4.3 with a forward compatible core profile.
	glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 4);
	glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 4);
	glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
	glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
	glfwWindowHint(GLFW_RESIZABLE, GL_FALSE);
	glfwWindowHint(GLFW_OPENGL_DEBUG_CONTEXT, GL_TRUE);

	if (!window)
	{
		glfwTerminate();
		cout << "Cannot create window" << endl;
		exit(EXIT_FAILURE);
	}

	glfwMakeContextCurrent(window);

	// 2. glew init
	if (glewInit() != GLEW_OK)
	{
		cerr << "Cannot init glew" << endl;
	}
	glClearColor(0.5f, 0.5f, 0.5f, 0.0f);

	// 3. OpenGL part
	// Load contents of file
	ifstream inFile("basic.vert");
	if (!inFile) {
		fprintf(stderr, "Error opening file: shader/basic.vert\n");
		exit(EXIT_FAILURE);
	}

	std::stringstream code;
	code << inFile.rdbuf();
	inFile.close();
	string codeStr(code.str());

	// Create the shader object
	GLuint vertShader = glCreateShader(GL_VERTEX_SHADER);
	if (0 == vertShader) {
		fprintf(stderr, "Error creating vertex shader.\n");
		exit(EXIT_FAILURE);
	}

	// Load the source code into the shader object
	const GLchar* codeArray[] = { codeStr.c_str() };
	glShaderSource(vertShader, 1, codeArray, NULL);

	// Compile the shader
	glCompileShader(vertShader);

	// Check compilation status
	GLint result;
	glGetShaderiv(vertShader, GL_COMPILE_STATUS, &result);
	if (GL_FALSE == result) {
		fprintf(stderr, "Vertex shader compilation failed!\n");

		GLint logLen;
		glGetShaderiv(vertShader, GL_INFO_LOG_LENGTH, &logLen);

		if (logLen > 0) {
			char * log = (char *)malloc(logLen);

			GLsizei written;
			glGetShaderInfoLog(vertShader, logLen, &written, log);

			fprintf(stderr, "Shader log: \n%s", log);

			free(log);
		}
	}

	//////////////////////////////////////////////////////
	/////////// Fragment shader //////////////////////////
	//////////////////////////////////////////////////////

	// Load contents of file into shaderCode here
	ifstream fragFile("basic.frag");
	if (!fragFile) {
		fprintf(stderr, "Error opening file: shader/basic.frag\n");
		exit(1);
	}

	std::stringstream fragCode;
	fragCode << fragFile.rdbuf();
	fragFile.close();
	codeStr = fragCode.str();

	// Create the shader object
	GLuint fragShader = glCreateShader(GL_FRAGMENT_SHADER);
	if (0 == fragShader) {
		fprintf(stderr, "Error creating fragment shader.\n");
		exit(1);
	}

	// Load the source code into the shader object
	codeArray[0] = codeStr.c_str();
	glShaderSource(fragShader, 1, codeArray, NULL);

	// Compile the shader
	glCompileShader(fragShader);

	// Check compilation status
	glGetShaderiv(fragShader, GL_COMPILE_STATUS, &result);
	if (GL_FALSE == result) {
		fprintf(stderr, "Fragment shader compilation failed!\n");

		GLint logLen;
		glGetShaderiv(fragShader, GL_INFO_LOG_LENGTH, &logLen);

		if (logLen > 0) {
			char * log = (char *)malloc(logLen);

			GLsizei written;
			glGetShaderInfoLog(fragShader, logLen, &written, log);

			fprintf(stderr, "Shader log: \n%s", log);

			free(log);
		}
	}

	// Create the program object
	GLuint programHandle = glCreateProgram();
	if (0 == programHandle) {
		fprintf(stderr, "Error creating program object.\n");
		exit(1);
	}

	// Bind index 0 to the shader input variable "VertexPosition"
	//glBindAttribLocation(programHandle, 0, "VertexPosition");
	// Bind index 1 to the shader input variable "VertexColor"
	//glBindAttribLocation(programHandle, 1, "VertexColor");

	// Attach the shaders to the program object
	glAttachShader(programHandle, vertShader);
	glAttachShader(programHandle, fragShader);

	// Link the program
	glLinkProgram(programHandle);

	// Check for successful linking
	GLint status;
	glGetProgramiv(programHandle, GL_LINK_STATUS, &status);
	if (GL_FALSE == status) {

		fprintf(stderr, "Failed to link shader program!\n");

		GLint logLen;
		glGetProgramiv(programHandle, GL_INFO_LOG_LENGTH, &logLen);

		if (logLen > 0) {
			char * log = (char *)malloc(logLen);

			GLsizei written;
			glGetProgramInfoLog(programHandle, logLen, &written, log);

			fprintf(stderr, "Program log: \n%s", log);

			free(log);
		}
	}
	else {
		glUseProgram(programHandle);
	}

	/////////////////// Create the VBO ////////////////////
	float positionData[] = {
		-0.8f, -0.8f, 0.0f,
		0.8f, -0.8f, 0.0f,
		0.0f,  0.8f, 0.0f };
	float colorData[] = {
		1.0f, 0.0f, 0.0f,
		0.0f, 1.0f, 0.0f,
		0.0f, 0.0f, 1.0f };


	// Create and populate the buffer object
	GLuint vboHandles[2];
	glGenBuffers(2, vboHandles);
	GLuint positionBufferHandle = vboHandles[0];
	GLuint colorBufferHandle = vboHandles[1];

	glBindBuffer(GL_ARRAY_BUFFER, positionBufferHandle);
	glBufferData(GL_ARRAY_BUFFER, 9 * sizeof(float), positionData, GL_STATIC_DRAW);

	glBindBuffer(GL_ARRAY_BUFFER, colorBufferHandle);
	glBufferData(GL_ARRAY_BUFFER, 9 * sizeof(float), colorData, GL_STATIC_DRAW);

	// Create and set-up the vertex array object
	glGenVertexArrays(1, &vaoHandle);
	glBindVertexArray(vaoHandle);

	glEnableVertexAttribArray(0);  // Vertex position
	glEnableVertexAttribArray(1);  // Vertex color

	glBindBuffer(GL_ARRAY_BUFFER, positionBufferHandle);
	glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, (GLubyte *)NULL);

	glBindBuffer(GL_ARRAY_BUFFER, colorBufferHandle);
	glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 0, (GLubyte *)NULL);

	// Enter the main loop
	mainLoop();

	// Close window and terminate GLFW
	glfwTerminate();
	// Exit program
	exit(EXIT_SUCCESS);
}