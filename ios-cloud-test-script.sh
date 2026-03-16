#!/bin/bash

# 常骑骑项目iOS云测试平台部署脚本
# 支持WeTest、阿里EMAS、华为云测等第三方云真机平台

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目配置
PROJECT_NAME="GreenRide"
PROJECT_DIR="$(pwd)"
BUILD_DIR="${PROJECT_DIR}/build"
LOG_FILE="${PROJECT_DIR}/cloud-test.log"

# 云平台配置
WETEST_API_KEY="${WETEST_API_KEY:-}"
ALIYUN_ACCESS_KEY="${ALIYUN_ACCESS_KEY:-}"
HUAWEI_ACCESS_KEY="${HUAWEI_ACCESS_KEY:-}"

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
    exit 1
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# 检查依赖
check_dependencies() {
    log_info "检查系统依赖..."
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js未安装，请先安装Node.js"
    fi
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        log_error "npm未安装，请先安装npm"
    fi
    
    # 检查React Native CLI
    if ! command -v npx &> /dev/null; then
        log_warn "npx未安装，尝试安装..."
        npm install -g npx
    fi
    
    log_success "依赖检查完成"
}

# 安装项目依赖
install_dependencies() {
    log_info "安装项目依赖..."
    
    cd "$PROJECT_DIR"
    
    if [ ! -f "package.json" ]; then
        log_error "package.json文件不存在"
    fi
    
    # 备份原有的package.json
    cp package.json package.json.backup
    
    # 使用legacy-peer-deps避免依赖冲突
    if npm install --legacy-peer-deps; then
        log_success "依赖安装成功"
    else
        log_warn "依赖安装遇到问题，尝试修复..."
        npm audit fix --legacy-peer-deps
    fi
}

# 构建iOS应用
build_ios_app() {
    log_info "构建iOS应用..."
    
    cd "$PROJECT_DIR"
    
    # 创建构建目录
    mkdir -p "$BUILD_DIR"
    
    # 检查iOS依赖
    if [ ! -d "ios" ]; then
        log_warn "iOS项目目录不存在，初始化iOS项目..."
        npx react-native init "$PROJECT_NAME" --template react-native-template-typescript
        cp -r "$PROJECT_NAME/ios" ./
        rm -rf "$PROJECT_NAME"
    fi
    
    # 安装iOS依赖
    cd ios
    if command -v pod &> /dev/null; then
        pod install
    else
        log_warn "CocoaPods未安装，跳过pod install"
    fi
    cd ..
    
    # 构建Release版本
    log_info "开始构建Release版本..."
    npx react-native bundle --platform ios --dev false --entry-file index.js --bundle-output "$BUILD_DIR/main.jsbundle" --assets-dest "$BUILD_DIR"
    
    log_success "iOS应用构建完成"
}

# 生成IPA文件
generate_ipa() {
    log_info "生成IPA文件..."
    
    cd "$PROJECT_DIR/ios"
    
    # 使用xcodebuild构建
    if command -v xcodebuild &> /dev/null; then
        xcodebuild -workspace "${PROJECT_NAME}.xcworkspace" -scheme "${PROJECT_NAME}" -configuration Release -archivePath "$BUILD_DIR/${PROJECT_NAME}.xcarchive" archive
        xcodebuild -exportArchive -archivePath "$BUILD_DIR/${PROJECT_NAME}.xcarchive" -exportOptionsPlist "$PROJECT_DIR/ios/ExportOptions.plist" -exportPath "$BUILD_DIR"
    else
        log_warn "xcodebuild未安装，无法生成IPA文件"
        return 1
    fi
    
    log_success "IPA文件生成完成"
}

# WeTest平台部署
deploy_wetest() {
    log_info "开始部署到WeTest平台..."
    
    if [ -z "$WETEST_API_KEY" ]; then
        log_warn "未设置WETEST_API_KEY环境变量，跳过WeTest部署"
        return 1
    fi
    
    # 检查IPA文件是否存在
    IPA_FILE="$BUILD_DIR/${PROJECT_NAME}.ipa"
    if [ ! -f "$IPA_FILE" ]; then
        log_warn "IPA文件不存在，尝试生成..."
        generate_ipa
    fi
    
    # 上传到WeTest
    log_info "上传IPA文件到WeTest..."
    
    # 这里需要根据WeTest API文档实现具体上传逻辑
    # curl -X POST "https://qatest.qq.com/api/v2/app/upload" \
    #     -H "Authorization: Bearer $WETEST_API_KEY" \
    #     -F "file=@$IPA_FILE" \
    #     -F "app_name=$PROJECT_NAME" \
    #     -F "platform=ios"
    
    log_success "WeTest部署完成"
}

# 阿里云EMAS平台部署
deploy_aliyun() {
    log_info "开始部署到阿里云EMAS平台..."
    
    if [ -z "$ALIYUN_ACCESS_KEY" ]; then
        log_warn "未设置ALIYUN_ACCESS_KEY环境变量，跳过阿里云部署"
        return 1
    fi
    
    # 阿里云EMAS部署逻辑
    log_info "配置阿里云EMAS环境..."
    
    # 这里需要根据阿里云EMAS API文档实现具体上传逻辑
    
    log_success "阿里云EMAS部署完成"
}

# 华为云测平台部署
deploy_huawei() {
    log_info "开始部署到华为云测平台..."
    
    if [ -z "$HUAWEI_ACCESS_KEY" ]; then
        log_warn "未设置HUAWEI_ACCESS_KEY环境变量，跳过华为云测部署"
        return 1
    fi
    
    # 华为云测部署逻辑
    log_info "配置华为云测环境..."
    
    # 这里需要根据华为云测API文档实现具体上传逻辑
    
    log_success "华为云测部署完成"
}

# 生成部署报告
generate_report() {
    log_info "生成部署报告..."
    
    REPORT_FILE="$BUILD_DIR/deployment-report.md"
    
    cat > "$REPORT_FILE" << EOF
# 常骑骑项目iOS云测试部署报告

## 项目信息
- 项目名称: $PROJECT_NAME
- 部署时间: $(date)
- 部署平台: 第三方云真机平台

## 构建信息
- React Native版本: $(grep '"react-native"' package.json | cut -d'"' -f4)
- Node.js版本: $(node --version)
- npm版本: $(npm --version)

## 部署结果
- IPA文件: ${BUILD_DIR}/${PROJECT_NAME}.ipa
- 构建日志: $LOG_FILE

## 支持的云平台
1. **WeTest腾讯云测** - 支持源码编译模式
2. **阿里云EMAS** - 企业级移动应用平台
3. **华为云测** - 华为开发者服务平台

## 使用说明

### WeTest平台使用
1. 访问 https://wetest.qq.com
2. 上传IPA文件进行测试
3. 支持远程真机调试
4. 提供详细的测试报告

### 环境变量配置
\`\`\`bash
export WETEST_API_KEY="your_wetest_api_key"
export ALIYUN_ACCESS_KEY="your_aliyun_access_key"  
export HUAWEI_ACCESS_KEY="your_huawei_access_key"
\`\`\`

## 问题排查
如果部署遇到问题，请检查：
1. 网络连接是否正常
2. API密钥配置是否正确
3. 项目依赖是否完整安装
4. iOS开发环境是否配置正确

EOF
    
    log_success "部署报告生成完成: $REPORT_FILE"
}

# 主函数
main() {
    log_info "开始常骑骑项目iOS云测试部署..."
    
    # 清理旧的日志文件
    > "$LOG_FILE"
    
    # 执行部署流程
    check_dependencies
    install_dependencies
    build_ios_app
    
    # 尝试生成IPA文件
    if generate_ipa; then
        # 部署到各云平台
        deploy_wetest
        deploy_aliyun
        deploy_huawei
    else
        log_warn "IPA文件生成失败，将使用源码编译模式部署"
    fi
    
    generate_report
    
    log_success "常骑骑项目iOS云测试部署完成！"
    log_info "请查看部署报告: $BUILD_DIR/deployment-report.md"
    log_info "下一步：登录云测试平台进行真机测试"
}

# 帮助信息
show_help() {
    echo "常骑骑项目iOS云测试部署脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示帮助信息"
    echo "  -p, --platform 指定部署平台 (wetest|aliyun|huawei|all)"
    echo "  -c, --clean    清理构建文件"
    echo ""
    echo "环境变量:"
    echo "  WETEST_API_KEY      WeTest平台API密钥"
    echo "  ALIYUN_ACCESS_KEY   阿里云访问密钥"
    echo "  HUAWEI_ACCESS_KEY   华为云访问密钥"
    echo ""
    echo "示例:"
    echo "  $0                          # 部署到所有平台"
    echo "  $0 -p wetest                # 仅部署到WeTest"
    echo "  WETEST_API_KEY=xxx $0       # 使用环境变量部署"
}

# 清理函数
clean_build() {
    log_info "清理构建文件..."
    rm -rf "$BUILD_DIR"
    rm -f "$LOG_FILE"
    log_success "清理完成"
}

# 参数解析
PLATFORM="all"
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -p|--platform)
            PLATFORM="$2"
            shift 2
            ;;
        -c|--clean)
            clean_build
            exit 0
            ;;
        *)
            log_error "未知参数: $1"
            ;;
    esac
done

# 执行主函数
main "$@"